import { NextRequest, NextResponse } from "next/server";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const GRAPH_API_VERSION = "v21.0";

type MetaEventPayload = {
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  customData?: Record<string, unknown>;
  // Datos del usuario ya hasheados en SHA256 en el cliente, o crudos si prefieres
  // hashearlos aquí en el servidor (recomendado para no exponer lógica de hash al cliente).
  userData?: {
    email?: string;
    phone?: string;
    fbp?: string; // cookie _fbp del navegador
    fbc?: string; // cookie _fbc del navegador (o fbclid de la URL)
  };
};

export async function POST(req: NextRequest) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Meta CAPI no está configurado (faltan variables de entorno)." },
      { status: 500 }
    );
  }

  try {
    const body: MetaEventPayload = await req.json();
    const { eventName, eventId, eventSourceUrl, customData, userData } = body;

    if (!eventName || !eventId || !eventSourceUrl) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: eventName, eventId, eventSourceUrl." },
        { status: 400 }
      );
    }

    // IP y user agent del request original, para mejorar el match quality
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId, // debe coincidir con el eventID del pixel en el navegador (deduplicación)
          event_source_url: eventSourceUrl,
          action_source: "website",
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
            fbp: userData?.fbp,
            fbc: userData?.fbc,
            // email/phone deben llegar ya hasheados en SHA256 si se envían
            ...(userData?.email ? { em: [userData.email] } : {}),
            ...(userData?.phone ? { ph: [userData.phone] } : {}),
          },
          custom_data: customData ?? {},
        },
      ],
    };

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      console.error("Meta CAPI error:", result);
      return NextResponse.json({ error: result }, { status: res.status });
    }

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Error enviando evento a Meta CAPI:", err);
    return NextResponse.json(
      { error: "Error interno procesando el evento." },
      { status: 500 }
    );
  }
}