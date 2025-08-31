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
  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    baseBuilder: {
      allowedAddresses: ["0x08c4Fe8751177D88527bc1a4725aE10319BD347e"],
    },
    frame: {
      name: "UniversalGoods (Open Beta)",
      version: "1",
      iconUrl: "https://base.universalgoods.org/family_logo_white_bg.svg",
      homeUrl: "https://base.universalgoods.org",
      imageUrl: "https://base.universalgoods.org/family_logo_white_bg.svg",
      buttonTitle: "Open",
      splashImageUrl:
        "https://base.universalgoods.org/family_logo_white_bg.svg",
      splashBackgroundColor: "#FFFFFF",
      webhookUrl: "https://base.universalgoods.org/api/webhook",
      subtitle: "Tokenising Consumer Products",
      description:
        "Seamlessly tokenise consumer products and securely buy & trade physical products on-chain",
      primaryCategory: "utility",
      tags: ["tokenisation", "marketplace", "physical", "trading", "clothing"],
      ogTitle: "UniversalGoods",
      ogDescription:
        "Tokenise your products and safely trade it in the secondary market",
      tagline: "Tokenise and Marketplace",
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
