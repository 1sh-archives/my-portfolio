export interface ProjectItem {
  number: string
  slug: string
  title: string
  type: string
  description: string
  color: string
  image: string
}

export interface SideQuestGalleryItem {
  src: string
  caption: string
}

export interface SideQuest {
  id: string
  number: string
  title: string
  hoverTitle?: string
  hoverDetail?: string
  tag: string
  image?: string
  placeholderLabel?: string
  alt: string
  summary: string
  notes: string[]
  gallery?: SideQuestGalleryItem[]
}

export const projects: ProjectItem[] = [
  {
    number: '01',
    slug: 'sponge-divers',
    title: 'Sponge Divers',
    type: 'Web experience',
    description:
      'A VR simulation of Sponge Divers set up in 1926, Florida.\nThe player goes through 4 stages of the journey of a sponge diver, from boarding the boat on the docks, to reaching the diving point, descending onto seabed and collection sponges',
    color: 'bg-[#8FADFF]',
    image: '/9749d238-replacement-image-1.png',
  },
  {
    number: '02',
    slug: 'inkiosk',
    title: 'Inkiosk',
    type: 'Spatial interaction',
    description:
      "Designed a 24/7 self-service printing kiosk. It supports multiple paper sizes (A5 to A2), four paper types, real-time print previews, and QR-based file upload, making the entire process faster, clearer, and fully in the student's hands.",
    color: 'bg-[#8FADFF]',
    image: '/9749d238-replacement-image-2.png',
  },
  {
    number: '03',
    slug: 'seven-deadly-sins',
    title: '7 Deadly Sins',
    type: 'Product design',
    description:
      'An interactive experiece based on the concept of 7 deadly sins, where the player commits to a sin using a ring, goes through a questionnaire and based on the asnwers, a judgment is presented through projection mapping.',
    color: 'bg-[#1e283b]',
    image: '/9749d238-replacement-image-3.png',
  },
]

export const sideQuests: SideQuest[] = [
  {
    id: 'side-quest-01',
    number: '01',
    title: 'Experimental Modular Typeface',
    hoverTitle: 'Modular Type Study',
    hoverDetail: 'Angular geometric A–Z glyphs with crisp notches and circular pivots.',
    tag: 'Typography & Form',
    image: '/side-quest-01.png',
    alt: 'Experimental typographic artwork',
    summary:
      'An exploration into angular, geometric letterforms built on a strict modular grid with cut notches and counter-forms.',
    notes: [
      'Tested high-contrast sharp terminals against circular pivot points across A–Z.',
      'Focused on rhythm and silhouette consistency when viewed at display scale.',
      'Created as a visual playground for custom display lettering and kinetic titles.',
    ],
    gallery: [
      {
        src: '/side-quest-01.png',
        caption: 'Full character set study — angular geometric construction and negative-space cutouts.',
      },
    ],
  },
  {
    id: 'side-quest-02',
    number: '02',
    title: 'Side Quest 02',
    hoverTitle: 'Quest 02 · Sketch',
    hoverDetail: 'Early visual study exploring grid tension, contrast, and motion.',
    tag: 'Visual Experiment',
    placeholderLabel: 'IMAGE PLACEHOLDER 02',
    alt: 'Side Quest 02 preview',
    summary: 'Add your notes, process breakdown, and extra visuals for Side Quest 02 here.',
    notes: [
      'Initial concept sketch and visual direction notes.',
      'Key experiments, tools used, and what worked or surprised you.',
    ],
  },
  {
    id: 'side-quest-03',
    number: '03',
    title: 'Side Quest 03',
    hoverTitle: 'Quest 03 · Study',
    hoverDetail: 'Interactive form exploration and spatial composition test.',
    tag: 'Visual Experiment',
    placeholderLabel: 'IMAGE PLACEHOLDER 03',
    alt: 'Side Quest 03 preview',
    summary: 'Add your notes, process breakdown, and extra visuals for Side Quest 03 here.',
    notes: [
      'Initial concept sketch and visual direction notes.',
      'Key experiments, tools used, and what worked or surprised you.',
    ],
  },
  {
    id: 'side-quest-04',
    number: '04',
    title: 'Side Quest 04',
    hoverTitle: 'Quest 04 · Shader',
    hoverDetail: 'Light, depth, and surface material experiment.',
    tag: 'Visual Experiment',
    placeholderLabel: 'IMAGE PLACEHOLDER 04',
    alt: 'Side Quest 04 preview',
    summary: 'Add your notes, process breakdown, and extra visuals for Side Quest 04 here.',
    notes: [
      'Initial concept sketch and visual direction notes.',
      'Key experiments, tools used, and what worked or surprised you.',
    ],
  },
  {
    id: 'side-quest-05',
    number: '05',
    title: 'Side Quest 05',
    hoverTitle: 'Quest 05 · Prototype',
    hoverDetail: 'Micro-interaction feel and timing curve experiment.',
    tag: 'Visual Experiment',
    placeholderLabel: 'IMAGE PLACEHOLDER 05',
    alt: 'Side Quest 05 preview',
    summary: 'Add your notes, process breakdown, and extra visuals for Side Quest 05 here.',
    notes: [
      'Initial concept sketch and visual direction notes.',
      'Key experiments, tools used, and what worked or surprised you.',
    ],
  },
  {
    id: 'side-quest-06',
    number: '06',
    title: 'Side Quest 06',
    hoverTitle: 'Quest 06 · 3D Form',
    hoverDetail: 'Sculpted silhouette and wireframe breakdown.',
    tag: 'Visual Experiment',
    placeholderLabel: 'IMAGE PLACEHOLDER 06',
    alt: 'Side Quest 06 preview',
    summary: 'Add your notes, process breakdown, and extra visuals for Side Quest 06 here.',
    notes: [
      'Initial concept sketch and visual direction notes.',
      'Key experiments, tools used, and what worked or surprised you.',
    ],
  },
  {
    id: 'side-quest-07',
    number: '07',
    title: 'Side Quest 07',
    hoverTitle: 'Quest 07 · Audio-Visual',
    hoverDetail: 'Rhythmic visual cues tied to sound triggers.',
    tag: 'Visual Experiment',
    placeholderLabel: 'IMAGE PLACEHOLDER 07',
    alt: 'Side Quest 07 preview',
    summary: 'Add your notes, process breakdown, and extra visuals for Side Quest 07 here.',
    notes: [
      'Initial concept sketch and visual direction notes.',
      'Key experiments, tools used, and what worked or surprised you.',
    ],
  },
  {
    id: 'side-quest-08',
    number: '08',
    title: 'Side Quest 08',
    hoverTitle: 'Quest 08 · Layout Lab',
    hoverDetail: 'Editorial framing, type hierarchy, and negative space.',
    tag: 'Visual Experiment',
    placeholderLabel: 'IMAGE PLACEHOLDER 08',
    alt: 'Side Quest 08 preview',
    summary: 'Add your notes, process breakdown, and extra visuals for Side Quest 08 here.',
    notes: [
      'Initial concept sketch and visual direction notes.',
      'Key experiments, tools used, and what worked or surprised you.',
    ],
  },
  {
    id: 'side-quest-09',
    number: '09',
    title: 'Side Quest 09',
    hoverTitle: 'Quest 09 · Archive',
    hoverDetail: 'Miscellaneous visual notes and experimental frames.',
    tag: 'Visual Experiment',
    placeholderLabel: 'IMAGE PLACEHOLDER 09',
    alt: 'Side Quest 09 preview',
    summary: 'Add your notes, process breakdown, and extra visuals for Side Quest 09 here.',
    notes: [
      'Initial concept sketch and visual direction notes.',
      'Key experiments, tools used, and what worked or surprised you.',
    ],
  },
]