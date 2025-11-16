export interface SubCategory {
  name: string
  href: string
  badge?: string
  available?: boolean // true if products exist, false = redirect to coming soon
}

export interface CategorySection {
  title: string
  items: SubCategory[]
}

export interface MegaMenuCategory {
  name: string
  href: string
  sections: CategorySection[]
  available?: boolean // Main category availability
}

// Available product categories (based on current inventory)
export const availableCategories = [
  "Dining Room",
  "Seating", 
  "Living Room",
  "Chairs",
  "Tables"
]

export const megaMenuData: MegaMenuCategory[] = [
  {
    name: "Sofas",
    href: "/products?category=Sofas",
    sections: [
      {
        title: "Sofa",
        items: [
          { name: "All Sofas", href: "/products?category=Sofas" },
          { name: "Fabric Sofas", href: "/products?category=Sofas&material=Fabric" },
          { name: "Wooden Sofas", href: "/products?category=Sofas&material=Wood" },
          { name: "3 Seater Sofas", href: "/products?category=Sofas&seater=3" },
          { name: "2 Seater Sofas", href: "/products?category=Sofas&seater=2" },
          { name: "1 Seater Sofas", href: "/products?category=Sofas&seater=1" },
          { name: "3+1+1 Sofa Sets", href: "/products?category=Sofas&type=set" },
          { name: "Sofa Cum Beds", href: "/products?category=Sofas&type=cum-bed" },
          { name: "L Shaped Sofas", href: "/products?category=Sofas&shape=L" },
          { name: "Chaise Loungers", href: "/products?category=Sofas&type=chaise" },
          { name: "Outdoor Sofas", href: "/products?category=Sofas&type=outdoor" },
          { name: "Diwans", href: "/products?category=Sofas&type=diwan" },
        ],
      },
      {
        title: "Sofa Cum Bed",
        items: [
          { name: "All Sofa Cum Beds", href: "/products?type=sofa-cum-bed" },
          { name: "Wooden Sofa Cum Beds", href: "/products?type=sofa-cum-bed&material=wood" },
          { name: "Fabric Sofa Cum Beds", href: "/products?type=sofa-cum-bed&material=fabric" },
        ],
      },
      {
        title: "Recliners",
        items: [
          { name: "All Recliners", href: "/products?category=Recliners" },
          { name: "1 Seater Recliners", href: "/products?category=Recliners&seater=1" },
          { name: "2 Seater Recliners", href: "/products?category=Recliners&seater=2" },
          { name: "3 Seater Recliners", href: "/products?category=Recliners&seater=3" },
        ],
      },
      {
        title: "Seating",
        items: [
          { name: "Lounge Chairs", href: "/products?category=Chairs&type=lounge" },
          { name: "Accent Chairs", href: "/products?category=Chairs&type=accent" },
          { name: "Arm Chair", href: "/products?category=Chairs&type=arm" },
          { name: "Wingback Chairs", href: "/products?category=Chairs&type=wingback" },
          { name: "Massage Chair", href: "/products?category=Chairs&type=massage" },
          { name: "Bean Bags", href: "/products?category=Seating&type=bean-bag" },
          { name: "Loveseats", href: "/products?category=Seating&type=loveseat" },
          { name: "Benches", href: "/products?category=Seating&type=bench" },
          { name: "Ottomans", href: "/products?category=Seating&type=ottoman" },
          { name: "Stools", href: "/products?category=Seating&type=stool" },
        ],
      },
    ],
  },
  {
    name: "Living",
    href: "/products?category=Living Room",
    sections: [
      {
        title: "All Sofas",
        items: [
          { name: "Fabric Sofas", href: "/products?category=Sofas&material=Fabric" },
          { name: "Wooden Sofas", href: "/products?category=Sofas&material=Wood" },
          { name: "3 Seater Sofas", href: "/products?category=Sofas&seater=3" },
          { name: "2 Seater Sofas", href: "/products?category=Sofas&seater=2" },
          { name: "1 Seater Sofas", href: "/products?category=Sofas&seater=1" },
          { name: "Sofa Sets", href: "/products?category=Sofas&type=set" },
          { name: "Chaise Loungers", href: "/products?category=Sofas&type=chaise" },
          { name: "Diwans", href: "/products?category=Sofas&type=diwan" },
        ],
      },
      {
        title: "Chairs",
        items: [
          { name: "All Chairs", href: "/products?category=Chairs" },
          { name: "Lounge Chairs", href: "/products?category=Chairs&type=lounge" },
          { name: "Arm Chairs", href: "/products?category=Chairs&type=arm" },
          { name: "Wing Chairs", href: "/products?category=Chairs&type=wing" },
          { name: "Swing Chair", href: "/products?category=Chairs&type=swing" },
          { name: "Rocking Chairs", href: "/products?category=Chairs&type=rocking" },
          { name: "Massage Chair", href: "/products?category=Chairs&type=massage" },
          { name: "Metal Chairs", href: "/products?category=Chairs&material=metal" },
        ],
      },
      {
        title: "Tables",
        items: [
          { name: "All Tables", href: "/products?category=Tables" },
          { name: "Coffee Tables", href: "/products?category=Tables&type=coffee" },
          { name: "Coffee Table Sets", href: "/products?category=Tables&type=coffee-set" },
          { name: "Side Tables", href: "/products?category=Tables&type=side" },
          { name: "Nesting Tables", href: "/products?category=Tables&type=nesting" },
          { name: "Console Table", href: "/products?category=Tables&type=console" },
          { name: "Laptop Tables", href: "/products?category=Tables&type=laptop" },
        ],
      },
      {
        title: "Living Storage",
        items: [
          { name: "Bookshelves", href: "/products?category=Storage&type=bookshelf" },
          { name: "Chest of Drawers", href: "/products?category=Storage&type=chest" },
          { name: "Cabinets & Sideboards", href: "/products?category=Storage&type=cabinet" },
          { name: "Display Units", href: "/products?category=Storage&type=display" },
          { name: "Wall Shelves", href: "/products?category=Storage&type=wall-shelf" },
          { name: "Home Temples", href: "/products?category=Storage&type=temple" },
          { name: "Shoe Racks", href: "/products?category=Storage&type=shoe-rack" },
        ],
      },
      {
        title: "TV Units",
        items: [
          { name: "All TV Units", href: "/products?category=TV Units" },
          { name: "Solid Wood TV Units", href: "/products?category=TV Units&material=wood" },
          { name: "Engineered Wood TV Units", href: "/products?category=TV Units&material=engineered" },
        ],
      },
      {
        title: "Furnishing",
        items: [
          { name: "Sofa Covers", href: "/products?category=Furnishing&type=sofa-cover" },
          { name: "Cushion Covers", href: "/products?category=Furnishing&type=cushion" },
          { name: "Cushion Fillers", href: "/products?category=Furnishing&type=filler" },
          { name: "Rugs And Carpets", href: "/products?category=Furnishing&type=rug" },
          { name: "Table Runners", href: "/products?category=Furnishing&type=runner" },
          { name: "Floor Runners", href: "/products?category=Furnishing&type=floor-runner" },
        ],
      },
    ],
  },
  {
    name: "Bedroom",
    href: "/products?category=Bedroom",
    sections: [
      {
        title: "Beds",
        items: [
          { name: "All Beds", href: "/products?category=Beds" },
          { name: "Solid Wood Beds", href: "/products?category=Beds&material=wood" },
          { name: "Engineered Wood Beds", href: "/products?category=Beds&material=engineered" },
          { name: "Upholstered Beds", href: "/products?category=Beds&type=upholstered" },
          { name: "Hydraulic Storage Beds", href: "/products?category=Beds&type=hydraulic" },
          { name: "Poster Beds", href: "/products?category=Beds&type=poster" },
          { name: "Kids Beds", href: "/products?category=Beds&type=kids" },
          { name: "Metal Beds", href: "/products?category=Beds&material=metal" },
          { name: "Bed With Mattress", href: "/products?category=Beds&bundle=mattress", badge: "New" },
        ],
      },
      {
        title: "By Size",
        items: [
          { name: "King Size Beds", href: "/products?category=Beds&size=king" },
          { name: "Queen Size Beds", href: "/products?category=Beds&size=queen" },
          { name: "Double Beds", href: "/products?category=Beds&size=double" },
          { name: "Single Beds", href: "/products?category=Beds&size=single" },
        ],
      },
      {
        title: "Sofa Cum Beds",
        items: [
          { name: "Wooden Sofa Cum Beds", href: "/products?type=sofa-cum-bed&material=wood" },
          { name: "Fabric Sofa Cum Beds", href: "/products?type=sofa-cum-bed&material=fabric" },
          { name: "L Shaped Sofa Cum Beds", href: "/products?type=sofa-cum-bed&shape=L" },
          { name: "Single Sofa Cum Beds", href: "/products?type=sofa-cum-bed&size=single" },
        ],
      },
      {
        title: "Wardrobes",
        items: [
          { name: "All Wardrobe", href: "/products?category=Wardrobes" },
          { name: "Solid Wood Wardrobes", href: "/products?category=Wardrobes&material=wood" },
          { name: "Engineered Wood Wardrobes", href: "/products?category=Wardrobes&material=engineered" },
          { name: "1 Door Wardrobes", href: "/products?category=Wardrobes&doors=1" },
          { name: "2 Door Wardrobes", href: "/products?category=Wardrobes&doors=2" },
          { name: "3 Door Wardrobes", href: "/products?category=Wardrobes&doors=3" },
          { name: "4+ Door Wardrobes", href: "/products?category=Wardrobes&doors=4" },
          { name: "Sliding Door", href: "/products?category=Wardrobes&type=sliding" },
        ],
      },
      {
        title: "Bedroom Tables",
        items: [
          { name: "Bedside Tables", href: "/products?category=Tables&type=bedside" },
          { name: "Dressing Tables", href: "/products?category=Tables&type=dressing" },
          { name: "Breakfast Tables", href: "/products?category=Tables&type=breakfast" },
          { name: "Trunk & Blanket Box", href: "/products?category=Storage&type=trunk" },
        ],
      },
      {
        title: "Mattresses & Pillows",
        items: [
          { name: "All Mattress", href: "/products?category=Mattresses" },
          { name: "King Size Mattress", href: "/products?category=Mattresses&size=king" },
          { name: "Queen Size Mattress", href: "/products?category=Mattresses&size=queen" },
          { name: "Double Bed Mattress", href: "/products?category=Mattresses&size=double" },
          { name: "Single Bed Mattress", href: "/products?category=Mattresses&size=single" },
          { name: "Mattress Protectors", href: "/products?category=Bedding&type=protector" },
          { name: "Mattress Toppers", href: "/products?category=Bedding&type=topper" },
          { name: "Pillows", href: "/products?category=Bedding&type=pillow" },
        ],
      },
      {
        title: "Bundles & Combos",
        items: [
          { name: "King Size Bed + Mattress", href: "/products?bundle=king-bed-mattress" },
          { name: "Queen Size Bed + Mattress", href: "/products?bundle=queen-bed-mattress" },
          { name: "Single Size Bed + Mattress", href: "/products?bundle=single-bed-mattress" },
        ],
      },
      {
        title: "Bedding Essentials",
        items: [
          { name: "Bedsheets", href: "/products?category=Bedding&type=sheet" },
          { name: "Quilts and Comforters", href: "/products?category=Bedding&type=quilt" },
          { name: "Pillow Covers", href: "/products?category=Bedding&type=pillow-cover" },
        ],
      },
    ],
  },
  {
    name: "Dining",
    href: "/products?category=Dining",
    sections: [
      {
        title: "Dining Room Furniture",
        items: [
          { name: "Dining Sets", href: "/products?category=Dining&type=set" },
          { name: "All Dining Table Sets", href: "/products?category=Dining&type=table-set" },
          { name: "6 Seater Dining Sets", href: "/products?category=Dining&seater=6" },
          { name: "4 Seater Dining Sets", href: "/products?category=Dining&seater=4" },
          { name: "2 Seater Dining Sets", href: "/products?category=Dining&seater=2" },
          { name: "8 Seater Dining Sets", href: "/products?category=Dining&seater=8" },
          { name: "Folding/Extendable Dining Sets", href: "/products?category=Dining&type=folding" },
        ],
      },
      {
        title: "By Material",
        items: [
          { name: "Wooden Dining Sets", href: "/products?category=Dining&material=wood" },
          { name: "Marble Dining Sets", href: "/products?category=Dining&material=marble" },
          { name: "Metal Dining Sets", href: "/products?category=Dining&material=metal" },
        ],
      },
      {
        title: "Dining Chairs",
        items: [
          { name: "All Dining Chairs", href: "/products?category=Chairs&type=dining" },
          { name: "Wooden Dining Chairs", href: "/products?category=Chairs&type=dining&material=wood" },
          { name: "Fabric Dining Chairs", href: "/products?category=Chairs&type=dining&material=fabric" },
          { name: "Dining Benches", href: "/products?category=Seating&type=dining-bench" },
        ],
      },
      {
        title: "Dining Tables",
        items: [
          { name: "Chair Covers", href: "/products?category=Furnishing&type=chair-cover" },
          { name: "Chair Pads", href: "/products?category=Furnishing&type=chair-pad" },
          { name: "Table Covers", href: "/products?category=Furnishing&type=table-cover" },
          { name: "Table Mats", href: "/products?category=Furnishing&type=table-mat" },
          { name: "Table Runners", href: "/products?category=Furnishing&type=table-runner" },
        ],
      },
      {
        title: "Kitchen Storage & Organisers",
        items: [
          { name: "All Kitchen Storage", href: "/products?category=Kitchen&type=storage" },
          { name: "Cabinets & Sideboards", href: "/products?category=Kitchen&type=cabinet" },
          { name: "Chest of Drawers", href: "/products?category=Kitchen&type=chest" },
          { name: "Kitchen Cabinets", href: "/products?category=Kitchen&type=cabinet" },
          { name: "Kitchen Racks", href: "/products?category=Kitchen&type=rack" },
          { name: "Microwave Stands", href: "/products?category=Kitchen&type=microwave-stand" },
          { name: "Kitchen Trolleys", href: "/products?category=Kitchen&type=trolley" },
          { name: "Kitchen Island", href: "/products?category=Kitchen&type=island" },
        ],
      },
      {
        title: "Bar Furniture",
        items: [
          { name: "Bar Cabinets", href: "/products?category=Bar&type=cabinet" },
          { name: "Wine Racks", href: "/products?category=Bar&type=wine-rack" },
          { name: "Wine Trolleys", href: "/products?category=Bar&type=trolley" },
          { name: "Bar Table Sets", href: "/products?category=Bar&type=table-set" },
          { name: "Bar Stools", href: "/products?category=Bar&type=stool" },
          { name: "Bar Chairs", href: "/products?category=Bar&type=chair" },
          { name: "Bar Essentials", href: "/products?category=Bar&type=essential" },
        ],
      },
      {
        title: "Kitchen Essentials",
        items: [
          { name: "Chopping Boards", href: "/products?category=Kitchen&type=chopping-board" },
          { name: "Spice Box", href: "/products?category=Kitchen&type=spice-box" },
          { name: "Jars & Containers", href: "/products?category=Kitchen&type=container" },
          { name: "Casseroles", href: "/products?category=Kitchen&type=casserole" },
        ],
      },
      {
        title: "Dining Essentials",
        items: [
          { name: "Dinner Sets", href: "/products?category=Dining&type=dinner-set" },
          { name: "Plates", href: "/products?category=Dining&type=plate" },
          { name: "Bowls", href: "/products?category=Dining&type=bowl" },
          { name: "Cutlery Sets", href: "/products?category=Dining&type=cutlery" },
          { name: "Cups", href: "/products?category=Dining&type=cup" },
          { name: "Mugs", href: "/products?category=Dining&type=mug" },
          { name: "Drinking Glasses", href: "/products?category=Dining&type=glass" },
          { name: "Coasters & Trivets", href: "/products?category=Dining&type=coaster" },
          { name: "Salt & Pepper Shakers", href: "/products?category=Dining&type=shaker" },
        ],
      },
      {
        title: "Serveware",
        items: [
          { name: "Serving Trays", href: "/products?category=Dining&type=serving-tray" },
          { name: "Cake Stands", href: "/products?category=Dining&type=cake-stand" },
          { name: "Platters", href: "/products?category=Dining&type=platter" },
          { name: "Cutlery Holders", href: "/products?category=Dining&type=cutlery-holder" },
          { name: "Tissue Box", href: "/products?category=Dining&type=tissue-box" },
        ],
      },
    ],
  },
  {
    name: "Storage",
    href: "/products?category=Storage",
    sections: [
      {
        title: "Living Storage",
        items: [
          { name: "Bookshelves", href: "/products?category=Storage&type=bookshelf" },
          { name: "Cabinets & Sideboards", href: "/products?category=Storage&type=cabinet" },
          { name: "Chest of Drawers", href: "/products?category=Storage&type=chest" },
          { name: "Display Units", href: "/products?category=Storage&type=display" },
          { name: "Wall Shelves", href: "/products?category=Storage&type=wall-shelf" },
          { name: "Shoe Racks", href: "/products?category=Storage&type=shoe-rack" },
        ],
      },
      {
        title: "Bedroom Storage",
        items: [
          { name: "Wardrobes", href: "/products?category=Wardrobes" },
          { name: "Chest of Drawers", href: "/products?category=Storage&type=chest&room=bedroom" },
          { name: "Trunk & Blanket Box", href: "/products?category=Storage&type=trunk" },
          { name: "Bedside Tables", href: "/products?category=Tables&type=bedside" },
        ],
      },
      {
        title: "Kitchen Storage",
        items: [
          { name: "Kitchen Cabinets", href: "/products?category=Kitchen&type=cabinet" },
          { name: "Kitchen Racks", href: "/products?category=Kitchen&type=rack" },
          { name: "Microwave Stands", href: "/products?category=Kitchen&type=microwave-stand" },
          { name: "Kitchen Trolleys", href: "/products?category=Kitchen&type=trolley" },
        ],
      },
    ],
  },
  {
    name: "Study & Office",
    href: "/products?category=Office",
    sections: [
      {
        title: "Office Furniture",
        items: [
          { name: "Office Tables", href: "/products?category=Office&type=table" },
          { name: "Office Chairs", href: "/products?category=Office&type=chair" },
          { name: "Office Storage", href: "/products?category=Office&type=storage" },
          { name: "Study Tables", href: "/products?category=Office&type=study-table" },
          { name: "Computer Tables", href: "/products?category=Office&type=computer-table" },
        ],
      },
      {
        title: "Study Furniture",
        items: [
          { name: "Study Tables", href: "/products?category=Study&type=table" },
          { name: "Study Chairs", href: "/products?category=Study&type=chair" },
          { name: "Bookshelves", href: "/products?category=Study&type=bookshelf" },
          { name: "Kids Study Tables", href: "/products?category=Study&type=kids-table" },
        ],
      },
    ],
  },
]
