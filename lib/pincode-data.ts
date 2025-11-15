/**
 * Indian States, Districts, and their Pincodes
 * This is a simplified dataset - you can expand it with more accurate data
 */

export interface District {
  name: string
  pincode: string
}

export interface StateData {
  name: string
  districts: District[]
}

export const indianStatesData: StateData[] = [
  {
    name: "Maharashtra",
    districts: [
      { name: "Mumbai", pincode: "400001" },
      { name: "Pune", pincode: "411001" },
      { name: "Nagpur", pincode: "440001" },
      { name: "Thane", pincode: "400601" },
      { name: "Nashik", pincode: "422001" },
      { name: "Aurangabad", pincode: "431001" },
      { name: "Solapur", pincode: "413001" },
      { name: "Kolhapur", pincode: "416001" },
    ]
  },
  {
    name: "Delhi",
    districts: [
      { name: "Central Delhi", pincode: "110001" },
      { name: "New Delhi", pincode: "110011" },
      { name: "South Delhi", pincode: "110016" },
      { name: "North Delhi", pincode: "110007" },
      { name: "East Delhi", pincode: "110051" },
      { name: "West Delhi", pincode: "110015" },
    ]
  },
  {
    name: "Karnataka",
    districts: [
      { name: "Bangalore", pincode: "560001" },
      { name: "Mysore", pincode: "570001" },
      { name: "Hubli", pincode: "580020" },
      { name: "Mangalore", pincode: "575001" },
      { name: "Belgaum", pincode: "590001" },
    ]
  },
  {
    name: "Tamil Nadu",
    districts: [
      { name: "Chennai", pincode: "600001" },
      { name: "Coimbatore", pincode: "641001" },
      { name: "Madurai", pincode: "625001" },
      { name: "Tiruchirappalli", pincode: "620001" },
      { name: "Salem", pincode: "636001" },
    ]
  },
  {
    name: "Gujarat",
    districts: [
      { name: "Ahmedabad", pincode: "380001" },
      { name: "Surat", pincode: "395001" },
      { name: "Vadodara", pincode: "390001" },
      { name: "Rajkot", pincode: "360001" },
      { name: "Bhavnagar", pincode: "364001" },
    ]
  },
  {
    name: "Rajasthan",
    districts: [
      { name: "Jaipur", pincode: "302001" },
      { name: "Jodhpur", pincode: "342001" },
      { name: "Udaipur", pincode: "313001" },
      { name: "Kota", pincode: "324001" },
      { name: "Ajmer", pincode: "305001" },
    ]
  },
  {
    name: "West Bengal",
    districts: [
      { name: "Kolkata", pincode: "700001" },
      { name: "Howrah", pincode: "711101" },
      { name: "Durgapur", pincode: "713201" },
      { name: "Asansol", pincode: "713301" },
      { name: "Siliguri", pincode: "734001" },
    ]
  },
  {
    name: "Uttar Pradesh",
    districts: [
      { name: "Lucknow", pincode: "226001" },
      { name: "Kanpur", pincode: "208001" },
      { name: "Ghaziabad", pincode: "201001" },
      { name: "Agra", pincode: "282001" },
      { name: "Varanasi", pincode: "221001" },
      { name: "Noida", pincode: "201301" },
    ]
  },
  {
    name: "Telangana",
    districts: [
      { name: "Hyderabad", pincode: "500001" },
      { name: "Warangal", pincode: "506001" },
      { name: "Nizamabad", pincode: "503001" },
      { name: "Karimnagar", pincode: "505001" },
    ]
  },
  {
    name: "Andhra Pradesh",
    districts: [
      { name: "Visakhapatnam", pincode: "530001" },
      { name: "Vijayawada", pincode: "520001" },
      { name: "Guntur", pincode: "522001" },
      { name: "Nellore", pincode: "524001" },
      { name: "Tirupati", pincode: "517501" },
    ]
  },
  {
    name: "Kerala",
    districts: [
      { name: "Thiruvananthapuram", pincode: "695001" },
      { name: "Kochi", pincode: "682001" },
      { name: "Kozhikode", pincode: "673001" },
      { name: "Thrissur", pincode: "680001" },
      { name: "Kollam", pincode: "691001" },
    ]
  },
  {
    name: "Madhya Pradesh",
    districts: [
      { name: "Bhopal", pincode: "462001" },
      { name: "Indore", pincode: "452001" },
      { name: "Gwalior", pincode: "474001" },
      { name: "Jabalpur", pincode: "482001" },
      { name: "Ujjain", pincode: "456001" },
    ]
  },
  {
    name: "Bihar",
    districts: [
      { name: "Patna", pincode: "800001" },
      { name: "Gaya", pincode: "823001" },
      { name: "Bhagalpur", pincode: "812001" },
      { name: "Muzaffarpur", pincode: "842001" },
    ]
  },
  {
    name: "Punjab",
    districts: [
      { name: "Ludhiana", pincode: "141001" },
      { name: "Amritsar", pincode: "143001" },
      { name: "Jalandhar", pincode: "144001" },
      { name: "Patiala", pincode: "147001" },
      { name: "Chandigarh", pincode: "160001" },
    ]
  },
  {
    name: "Haryana",
    districts: [
      { name: "Faridabad", pincode: "121001" },
      { name: "Gurgaon", pincode: "122001" },
      { name: "Rohtak", pincode: "124001" },
      { name: "Panipat", pincode: "132103" },
      { name: "Karnal", pincode: "132001" },
    ]
  }
]

export const getStatesList = (): string[] => {
  return indianStatesData.map(state => state.name).sort()
}

export const getDistrictsList = (stateName: string): string[] => {
  const state = indianStatesData.find(s => s.name === stateName)
  return state ? state.districts.map(d => d.name).sort() : []
}

export const getPincode = (stateName: string, districtName: string): string => {
  const state = indianStatesData.find(s => s.name === stateName)
  if (!state) return ''
  
  const district = state.districts.find(d => d.name === districtName)
  return district ? district.pincode : ''
}
