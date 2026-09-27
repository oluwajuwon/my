import { WorkExperience } from "./types";
import emberDiscovery from "../../assets/work/ember/discovery-feed.webp";
import emberEventDetails from "../../assets/work/ember/event-details.webp";
import emberPlaceDetails from "../../assets/work/ember/place-details.webp";
import pocketGroup from "../../assets/work/pocketapp/group-pocket.webp";
import pocketProfile from "../../assets/work/pocketapp/profile.webp";
import pocketSendMoney from "../../assets/work/pocketapp/send-money.webp";

/**
 * Professional experience is ordered from current to oldest.
 *
 * Optional fields deliberately remain absent until verified public information
 * is available. Screenshot imports can be added when approved assets are
 * placed under src/assets/work.
 */
export const professionalWork: WorkExperience[] = [
  {
    slug: "stakemate",
    company: "Stakemate",
    current: true,
    category: "Social sports betting",
    summary: "A social sports-betting product built around betting with friends.",
    productDescription: [
      "Stakemate combines a sportsbook with social features such as group betting, chat and bet sharing. The product treats betting as an experience shared with friends, rather than only an individual interaction with a sportsbook.",
    ],
  },
  {
    slug: "ember",
    company: "Ember / BINDY Street",
    category: "Places and events discovery",
    summary: "A mobile product for discovering places, events and experiences nearby.",
    productDescription: [
      "Ember, operated by BINDY STREET LIMITED, was a consumer discovery product for finding places, events and experiences nearby. The mobile experience brought recommendations, venue information and event discovery together in one interface.",
    ],
    images: [
      {
        src: emberDiscovery,
        alt: "BINDY Street discovery feed showing activity categories and a rooftop venue recommendation",
        caption: "Discovery feed",
        orientation: "portrait",
        width: 1320,
        height: 2868,
      },
      {
        src: emberPlaceDetails,
        alt: "BINDY Street place details screen for Museum of the Home with photos, location and actions",
        caption: "Place details",
        orientation: "portrait",
        width: 1320,
        height: 2868,
      },
      {
        src: emberEventDetails,
        alt: "BINDY Street event details screen for Grease the Musical with photos and ticket actions",
        caption: "Event details",
        orientation: "portrait",
        width: 1320,
        height: 2868,
      },
    ],
  },
  {
    slug: "pocketapp",
    company: "PocketApp",
    location: "Nigeria",
    category: "Mobile money",
    summary: "A Nigerian mobile-money product for sending, receiving and managing money.",
    productDescription: [
      "PocketApp is a Nigerian mobile-money platform spanning personal payments, bank transfers, cards, business accounts and shared group spending.",
      "The product operates as a Central Bank of Nigeria licensed Mobile Money Operator, with customer funds insured by the Nigeria Deposit Insurance Corporation.",
    ],
    images: [
      {
        src: pocketGroup,
        alt: "PocketApp group pocket screen with request, send money, member and transaction controls",
        caption: "Group pocket",
        orientation: "portrait",
        width: 1320,
        height: 2868,
      },
      {
        src: pocketSendMoney,
        alt: "PocketApp send money screen with an amount keypad and daily spending limit",
        caption: "Send money",
        orientation: "portrait",
        width: 1320,
        height: 2868,
      },
      {
        src: pocketProfile,
        alt: "PocketApp profile screen with account tier, account controls and settings",
        caption: "Profile and account controls",
        orientation: "portrait",
        width: 1320,
        height: 2868,
      },
    ],
  },
];

export const getProfessionalWorkBySlug = (slug?: string) =>
  professionalWork.find((work) => work.slug === slug);
