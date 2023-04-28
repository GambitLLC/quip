const accessories = ["Cap", "Circle_Earring", "Earphone", "Earring", "Futuristic_Glasses", "Glasses", "Mask", "Mask_Google", "Moustache", "Rounded_Glasses", "Simple_Earring", "Stylish_Glasses"] as const;
type Accessory = typeof accessories[number];

const eyes = ["Angry", "Closed", "Cynic", "Normal", "Sad", "Thin"] as const;
type Eye = typeof eyes[number];

const face = ["Darker", "Fair", "Light", "Tanned"] as const;
type Face = typeof face[number];

//create a hair array and a Hair Type that contains the strings "01" through "23"
const hair = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"] as const;
type Hair = typeof hair[number];

const mouth = ["Angry", "Cute", "Eat", "Hate", "Normal_Smile", "Normal_Thin", "Open_Mouth", "Open_Tooth", "Sad", "Smiley"] as const;
type Mouth = typeof mouth[number];

const outfit = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"] as const;
type Outfit = typeof outfit[number];

export {
  accessories,
  Accessory,
  eyes,
  Eye,
  face,
  Face,
  hair,
  Hair,
  mouth,
  Mouth,
  outfit,
  Outfit
}
