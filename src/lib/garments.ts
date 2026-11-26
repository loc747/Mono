/** Flat-sketch garment drawings (viewBox 0 0 200 240). Stroke uses currentColor so tiles can recolor them. */
export type GarmentKind = 'coat' | 'shirt' | 'trousers' | 'jacket' | 'tote' | 'sneaker' | 'cap';

export const garments: Record<GarmentKind, string> = {
  coat: `
    <path d="M78 26 L52 38 L34 68 L28 198 L47 203 L57 118 L57 226 L143 226 L143 118 L153 203 L172 198 L166 68 L148 38 L122 26 Q100 40 78 26 Z"/>
    <path d="M78 26 L100 96 L122 26"/><path d="M100 96 V226"/>
    <path d="M57 118 L57 66"/><path d="M143 118 L143 66"/>
    <circle cx="108" cy="130" r="2.6"/><circle cx="108" cy="160" r="2.6"/><circle cx="108" cy="190" r="2.6"/>
    <path d="M66 168 H90 M110 168 H134"/><path d="M30 190 H46 M154 190 H170"/>`,
  shirt: `
    <path d="M76 28 L48 42 L22 96 L44 112 L58 90 L58 216 H142 V90 L156 112 L178 96 L152 42 L124 28 L100 50 Z"/>
    <path d="M76 28 L100 62 L124 28"/><path d="M100 62 V216"/>
    <circle cx="100" cy="86" r="2.4"/><circle cx="100" cy="116" r="2.4"/><circle cx="100" cy="146" r="2.4"/><circle cx="100" cy="176" r="2.4"/>
    <rect x="112" y="98" width="20" height="22"/><path d="M28 98 L47 108 M172 98 L153 108"/>`,
  trousers: `
    <path d="M60 28 H140 L150 112 L136 224 H106 L100 100 L94 224 H64 L50 112 Z"/>
    <path d="M60 44 H140"/><path d="M100 44 V100"/>
    <path d="M70 44 Q76 66 90 70 M130 44 Q124 66 110 70"/>
    <path d="M68 150 H84 M116 150 H132" opacity=".5"/>`,
  jacket: `
    <path d="M72 28 L46 40 L24 100 L46 116 L58 92 L58 208 H142 V92 L154 116 L176 100 L154 40 L128 28 L100 40 Z"/>
    <path d="M72 28 L100 58 L128 28"/><path d="M100 40 V208"/>
    <rect x="66" y="102" width="26" height="24"/><rect x="108" y="102" width="26" height="24"/>
    <path d="M66 112 H92 M108 112 H134"/>
    <path d="M58 180 H142"/><path d="M32 102 L46 112 M168 102 L154 112"/>`,
  tote: `
    <path d="M72 84 C72 26 128 26 128 84"/>
    <path d="M46 84 H154 L164 214 H36 Z"/>
    <rect x="72" y="134" width="56" height="48"/><path d="M72 150 H128"/>
    <path d="M46 84 L54 214 M154 84 L146 214" opacity=".45"/>`,
  sneaker: `
    <path d="M20 172 V128 C20 120 28 114 38 114 H64 C70 130 88 136 104 138 L142 146 C166 152 184 160 186 174 V186 H20 Z"/>
    <path d="M20 176 H186"/>
    <path d="M64 114 L70 98 L90 102 L86 122"/>
    <path d="M96 134 L104 122 M110 138 L118 126 M124 142 L132 130"/>
    <path d="M20 150 H44" opacity=".6"/><path d="M150 156 C160 158 170 164 176 172" opacity=".6"/>`,
  cap: `
    <path d="M40 150 C40 84 160 84 160 150 Z"/>
    <path d="M160 150 C184 150 198 158 198 167 C176 168 146 162 124 154"/>
    <path d="M100 98 V150"/><path d="M70 106 Q72 130 78 150 M130 106 Q128 130 122 150" opacity=".6"/>
    <circle cx="100" cy="90" r="3.4"/><path d="M40 150 H160"/>`,
};
