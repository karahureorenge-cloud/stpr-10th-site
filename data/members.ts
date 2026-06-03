// すとぷり 10周年メンバーデータ
// 画像は public/images/members/ 配下に配置（未配置でも SafeImage でフォールバック）。

export type Member = {
  id: string
  name: string
  nameEn: string
  color: string
  bgColor: string
  icon?: string // public/images/members/{id}-icon.jpg（丸アイコン）
  visual10th?: string // public/images/members/{id}-visual.png（カード表面）
  miniChara?: string // public/images/members/{id}-mini.png（カード裏面）
  catchphrase?: string
}

export const MEMBERS: Member[] = [
  {
    id: "rinu",
    name: "莉犬",
    nameEn: "RINU",
    color: "#C0392B",
    bgColor: "#FDE8E8",
    icon: "/images/members/rinu-icon.jpg",
    visual10th: "/images/members/rinu-visual.png",
    miniChara: "/images/members/rinu-mini.png",
  },
  {
    id: "root",
    name: "るぅと",
    nameEn: "ROOT",
    color: "#D4A017",
    bgColor: "#FDF6DC",
    icon: "/images/members/root-icon.jpg",
    visual10th: "/images/members/root-visual.png",
    miniChara: "/images/members/root-mini.png",
  },
  {
    id: "colon",
    name: "ころん",
    nameEn: "COLON",
    color: "#2980B9",
    bgColor: "#E8F4FD",
    icon: "/images/members/colon-icon.jpg",
    visual10th: "/images/members/colon-visual.png",
    miniChara: "/images/members/colon-mini.png",
  },
  {
    id: "satomi",
    name: "さとみ",
    nameEn: "SATOMI",
    color: "#E91E8C",
    bgColor: "#FDE8F4",
    icon: "/images/members/satomi-icon.jpg",
    visual10th: "/images/members/satomi-visual.png",
    miniChara: "/images/members/satomi-mini.png",
  },
  {
    id: "jel",
    name: "ジェル",
    nameEn: "JEL",
    color: "#E07B20",
    bgColor: "#FDF0E0",
    icon: "/images/members/jel-icon.jpg",
    visual10th: "/images/members/jel-visual.png",
    miniChara: "/images/members/jel-mini.png",
  },
  {
    id: "nanamori",
    name: "ななもり。",
    nameEn: "NANAMORi",
    color: "#7B52AB",
    bgColor: "#F0EBF8",
    icon: "/images/members/nanamori-icon.jpg",
    visual10th: "/images/members/nanamori-visual.png",
    miniChara: "/images/members/nanamori-mini.png",
  },
]
