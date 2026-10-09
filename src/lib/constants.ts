export const AREAS = [
  "MKU Campus Gate",
  "Witethie",
  "Runda",
  "Kasarani",
  "Section 2",
  "Section 9",
] as const;

export const UNIVERSITIES = [
  "Jomo Kenyatta University of Agriculture and Technology",
  "Mount Kenya University",
  "Thika TTI College",
  "Jordan College",
] as const;

export const AMENITIES = [
  "Wi-Fi",
  "Hot shower",
  "Backup power",
  "Security & CCTV",
  "Furnished",
  "Shared kitchen",
  "Private kitchen",
  "Laundry",
  "Parking",
  "Study desk",
  "Gym access",
  "Water 24/7",
] as const;

export const ROOM_TYPES = [
  { value: "single", label: "Single room" },
  { value: "shared", label: "Shared room" },
  { value: "studio", label: "Bedsitter" },
  { value: "one_bedroom", label: "1 Bedroom" },
  { value: "apartment", label: "Whole apartment" },
] as const;

export const MAINTENANCE_CATEGORIES = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "furniture", label: "Furniture & fittings" },
  { value: "internet", label: "Internet / Wi-Fi" },
  { value: "security", label: "Security" },
  { value: "cleaning", label: "Cleaning" },
  { value: "other", label: "Other" },
] as const;

export const PAYMENT_METHODS = ["Bank transfer", "Mobile money", "Cash", "Card"] as const;

export const MIN_PRICE = 50;
export const MAX_PRICE = 600;

/* Curated photography (royalty-free, hot-linked) used for seed listings and
   the image picker in the landlord listing form. */
export const IMG = {
  bedrooms: [
    "https://images.pexels.com/photos/8089071/pexels-photo-8089071.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/6588571/pexels-photo-6588571.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/6758516/pexels-photo-6758516.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/8089074/pexels-photo-8089074.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/6436794/pexels-photo-6436794.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/6538941/pexels-photo-6538941.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/6444257/pexels-photo-6444257.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/6956623/pexels-photo-6956623.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/6438743/pexels-photo-6438743.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/8146206/pexels-photo-8146206.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
  exteriors: [
    "https://images.pexels.com/photos/37224965/pexels-photo-37224965.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/27459248/pexels-photo-27459248.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/5674684/pexels-photo-5674684.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/29174530/pexels-photo-29174530.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/29174542/pexels-photo-29174542.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
  shared: [
    "https://images.pexels.com/photos/8089172/pexels-photo-8089172.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/5824894/pexels-photo-5824894.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/7587743/pexels-photo-7587743.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "https://images.pexels.com/photos/8135496/pexels-photo-8135496.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ],
};

export const ALL_IMAGES = [...IMG.bedrooms, ...IMG.exteriors, ...IMG.shared];
