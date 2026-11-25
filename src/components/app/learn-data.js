// The Educational topics, shared by the browse (edu-browse.jsx) and each topic's
// own page (learn-page.jsx): the sections in order, each topic's icon, and its
// colour (Spotify's browse colours, in turn). Study health comes first: schools,
// scholarships, attachments — the lists there are well-known names only; Lara
// looks up what changes (entry requirements, fees, deadlines).

import {
  Activity,
  Apple,
  Atom,
  Award,
  Baby,
  Bandage,
  Beaker,
  Biohazard,
  Bone,
  Brain,
  ClipboardCheck,
  Dna,
  Droplets,
  Dumbbell,
  Earth,
  Eye,
  FlaskConical,
  Flower,
  Globe,
  GraduationCap,
  Hand,
  HandHeart,
  HeartPulse,
  Hospital,
  Leaf,
  Microscope,
  Moon,
  Pill,
  Scan,
  School,
  Shield,
  ShieldPlus,
  Smile,
  Sparkles,
  Stethoscope,
  Syringe,
  TestTube,
  Users,
} from "lucide-react";

export const COLOURS = ["#8d67ab", "#503750", "#dc148c", "#e61e32", "#148a08", "#006450", "#2d46b9", "#8c1932", "#477d95", "#ba5d07", "#1e3264", "#27856a", "#e8115b", "#0d73ec", "#a56752", "#5f8109"];

export const SECTIONS = [
  { key: "study", topics: [["medicalSchools", School], ["nursingSchools", GraduationCap], ["scholarships", Award], ["attachments", Hospital], ["entry", ClipboardCheck], ["abroad", Globe]] },
  { key: "life", topics: [["biology", Leaf], ["anatomy", Bone], ["physiology", Activity], ["genetics", Dna], ["microbiology", Microscope], ["immunology", Shield]] },
  { key: "chemistry", topics: [["chemistry", FlaskConical], ["biochemistry", Atom], ["pharmacology", Pill], ["toxicology", Beaker], ["labScience", TestTube]] },
  { key: "mind", topics: [["psychology", Brain], ["neuroscience", Sparkles], ["mentalHealth", Smile], ["sleep", Moon]] },
  { key: "body", topics: [["heart", HeartPulse], ["diabetes", Droplets], ["cancer", Scan], ["infections", Biohazard], ["eyesEars", Eye], ["skin", Hand]] },
  { key: "family", topics: [["pregnancy", Baby], ["childHealth", Smile], ["puberty", Users], ["familyPlanning", HandHeart], ["menopause", Flower]] },
  { key: "living", topics: [["nutrition", Apple], ["fitness", Dumbbell], ["firstAid", Bandage], ["hygiene", Droplets], ["ageing", HandHeart]] },
  { key: "public", topics: [["outbreaks", Biohazard], ["vaccines", Syringe], ["globalHealth", Earth], ["healthSystems", Hospital], ["environment", ShieldPlus]] },
  { key: "careers", topics: [["medicine", Stethoscope], ["nursing", HandHeart], ["pharmacy", Pill], ["publicHealth", GraduationCap]] },
];

// every topic, with its section and colour
export const TOPICS = (() => {
  const all = {};
  let n = 0;
  for (const section of SECTIONS) {
    for (const [key, icon] of section.topics) all[key] = { key, icon, section: section.key, colour: COLOURS[n++ % COLOURS.length] };
  }
  return all;
})();

// Well-known places and programmes (names only; Lara finds the current details)
export const STUDY_LISTS = {
  medicalSchools: [
    "University of Nairobi — Faculty of Health Sciences",
    "Moi University — School of Medicine",
    "Kenyatta University — School of Medicine",
    "Aga Khan University — Medical College, East Africa",
    "Maseno University — School of Medicine",
    "Egerton University — Faculty of Health Sciences",
    "JKUAT — College of Health Sciences",
    "Kenya Methodist University — School of Medicine",
    "Mount Kenya University — School of Medicine",
    "Uzima University — School of Medicine",
  ],
  nursingSchools: [
    "Kenya Medical Training College (KMTC)",
    "University of Nairobi — School of Nursing Sciences",
    "Aga Khan University — School of Nursing and Midwifery",
    "Moi University — School of Nursing",
    "Kenyatta University — School of Nursing",
    "Kenya Methodist University — School of Nursing",
  ],
  scholarships: [
    "HELB loans and bursaries (Kenya)",
    "Mastercard Foundation Scholars Program",
    "Commonwealth Scholarships",
    "Chevening Scholarships (UK master's)",
    "DAAD scholarships (Germany)",
    "Aga Khan Foundation International Scholarship Programme",
  ],
};
