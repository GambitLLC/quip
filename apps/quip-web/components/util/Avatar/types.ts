const accessories = ["Cap", "Circle_Earring", "Earphone", "Earring", "Futuristic_Glasses", "Glasses", "Mask", "Mask_Google", "Moustache", "Rounded_Glasses", "Simple_Earring", "Stylish_Glasses"] as const;
type Accessory = typeof accessories[number];

const eyes = ["Angry", "Closed", "Cynic", "Normal", "Sad", "Thin"] as const;
type Eye = typeof eyes[number];

const faces = ["Darker", "Fair", "Light", "Tanned"] as const;
type Face = typeof faces[number];

//create a hair array and a Hair Type that contains the strings "01" through "23"
const hairs = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"] as const;
type Hair = typeof hairs[number];

const mouths = ["Angry", "Cute", "Eat", "Hate", "Normal_Smile", "Normal_Thin", "Open_Mouth", "Open_Tooth", "Sad", "Smiley"] as const;
type Mouth = typeof mouths[number];

const outfits = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"] as const;
type Outfit = typeof outfits[number];

const colors = ["green", "purple", "blue"] as const
type Color = typeof colors[number]

interface Avatar {
  accessory?: Accessory,
  hair?: Hair,
  eye: Eye,
  face: Face,
  mouth: Mouth,
  outfit: Outfit,
  color: Color
}

export {
  accessories,
  Accessory,
  eyes,
  Eye,
  faces,
  Face,
  hairs,
  Hair,
  mouths,
  Mouth,
  outfits,
  Outfit,
  colors,
  Color,
  Avatar,
}
