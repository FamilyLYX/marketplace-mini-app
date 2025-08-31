// function withValidProperties(
//   properties: Record<string, undefined | string | string[]>
// ) {
//   return Object.fromEntries(
//     Object.entries(properties).filter(([key, value]) => {
//       if (Array.isArray(value)) {
//         return value.length > 0;
//       }
//       return !!value;
//     })
//   );
// }

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    baseBuilder: {
      allowedAddresses: [
        "0xbDaC5dD38C329Dc774a716c0BE0d6746568dEe3A",
        "0x08c4Fe8751177D88527bc1a4725aE10319BD347e",
      ],
    },
    frame: {
      version: "1",
      name: "Test Builder",
      homeUrl: URL,
      iconUrl: `${URL}/icon.png`,
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: "#000000",
      primaryCategory: "builder",
      tags: ["builder"],
      heroImageUrl: `${URL}/hero.png`,
      tagline: "Test Builder",
      webhookUrl: `${URL}/api/webhook`,
    },
    // frame: withValidProperties({
    //   version: "1",
    //   name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
    //   subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
    //   description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    //   screenshotUrls: [],
    //   iconUrl: process.env.NEXT_PUBLIC_APP_ICON,
    //   splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
    //   splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
    //   homeUrl: URL,
    //   webhookUrl: `${URL}/api/webhook`,
    //   primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
    //   tags: [],
    //   heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
    //   tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
    //   ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
    //   ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
    //   ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
    // }),
  });
}
