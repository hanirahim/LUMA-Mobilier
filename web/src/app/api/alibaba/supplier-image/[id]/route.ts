import { NextRequest, NextResponse } from "next/server";
const images:Record<string,string>={
  "1601897944769": "https://s.alicdn.com/@sc04/kf/H872dd156025a4382a6133e4ef20dacceP/Express-Garden-Lightweight-Durable-Aluminum-Alloy-Modern.png_200x200.jpg",
  "1601890187112": "https://s.alicdn.com/@sc04/kf/He2dcb55893744fbdb3f8b8ed68d1759aE/Express-Garden-Lightweight-Aluminum-Alloy-Modern-Stackable.png_200x200.jpg",
  "1601627236159": "https://s.alicdn.com/@sc04/kf/Hcfbcc3876b444d0fa63e82a3a4853c611/Express-Garden-Luxury-Modern-Aluminum-Eco-Friendly.jpg",
  "1601796519408": "https://s.alicdn.com/@sc04/kf/H174dfc46fb7945a589bdcfd065246e64y/Express-Garden-5-Piece-Rattan-Aluminum-Outdoor.jpg",
  "1601796653657": "https://s.alicdn.com/@sc04/kf/H5c08fffb2ba74da6bc4517ab8a970107p/Express-Garden-Modern-Aluminum-Outdoor-Patio-Furniture.jpg",
  "1601627129141": "https://s.alicdn.com/@sc04/kf/Haae4c6fbb2c84773a80c9e8c9da4d6fch/Express-Garden-Modern-Hotel-Portable-Outdoor-Pool.jpg",
  "1601617661095": "https://s.alicdn.com/@sc04/kf/H16af1f0ec3ff4f8fa9a08f814e9a8a75W/Express-Garden-Modern-Luxury-Aluminum-Rope-Waterproof.jpg",
  "1601630966049": "https://s.alicdn.com/@sc04/kf/H2f9be65d58d44631a3cb2949a5ca1539z/Express-Garden-Luxury-Modern-Rattan-Outdoor-Furniture.jpg",
  "1601629498552": "https://s.alicdn.com/@sc04/kf/He0e97fbaad0e44e99f98af2c25c9a22dv/Express-Garden-Modern-5-Person-Aluminum-Outdoor.jpg",
  "1601627026602": "https://s.alicdn.com/@sc04/kf/H2d9ff206b4f44a2587435f02c87bed68p/Express-Garden-Modern-Luxury-Aluminum-5-Piece.jpg",
  "1601613094464": "https://s.alicdn.com/@sc04/kf/H940fadd6f2204bdeb2125eb4aa8575cfc/Express-Garden-Modern-Villa-Outdoor-Aluminum-Sofa.jpg",
  "1601618933487": "https://s.alicdn.com/@sc04/kf/Hf7cecd451f2e412e8abc29a9279e57d32/Express-Garden-Modern-UV-Resistant-Rattan-Aluminum.jpg",
  "1601629423687": "https://s.alicdn.com/@sc04/kf/H668e85256bae45a5a3e2aa068149a5aaD/Express-Garden-Modern-Aluminum-Outdoor-Sofa-Set.jpg",
  "1601619447259": "https://s.alicdn.com/@sc04/kf/H3ba49a1d9ce14b07b43cb6f282547dbaX/Express-Garden-PE-Rattan-Portable-Adjustable-Outdoor.jpg",
  "1601621209577": "https://s.alicdn.com/@sc04/kf/H7cbe2240d0af4cd3bbc222798411e6a9W/Express-Garden-Lightweight-Aluminum-Alloy-Modern-Stackable.jpg_480x480.jpg",
  "1601627572429": "https://s.alicdn.com/@sc04/kf/H9d031d9ee81444cd8caeccee0ff2f578x/Express-Garden-Modern-Luxury-KD-Rattan-Aluminum.jpg",
  "1601619163950": "https://s.alicdn.com/@sc04/kf/Hd2f4f2a21c604c05a76d8060690fc80af/Modern-Aluminum-Waterproof-Durable-Eco-Friendly-Outdoor.jpg_480x480.jpg",
  "1601806744290": "https://s.alicdn.com/@sc04/kf/H4e4788ada3d646a6a35750ea5804ecb0G/Express-Garden-Modern-Villa-Aluminum-Outdoor-Sofa.jpg",
  "1601617310397": "https://s.alicdn.com/@sc04/kf/Hebaba69d3d0241d2be3e68cdbc32258c3/Express-Garden-Modern-Outdoor-Sofa-Set-Aluminum.jpg",
  "1601629616821": "https://s.alicdn.com/@sc04/kf/Hc98d0b77aaf745079fa417c82e8fdf6c5/Express-Garden-Modern-Aluminum-Outdoor-Sofa-Set.jpg"
};
export async function GET(_request:NextRequest,context:{params:Promise<{id:string}>}){
 if(process.env.VERCEL_ENV!=="preview")return new NextResponse(null,{status:404});
 const {id}=await context.params;
 const url=images[id];if(!url)return new NextResponse(null,{status:404});
 return NextResponse.redirect(url,{status:307,headers:{"Cache-Control":"public, max-age=3600","X-Robots-Tag":"noindex"}});
}
