export type DeviceCategory = "Smartphone" | "Laptop" | "Tablet" | "Audio";

export interface DeviceModel {
  id: string;
  name: string;
  maskType?: "phone" | "laptop" | "tablet" | "earbuds";
}

export interface DeviceBrand {
  id: string;
  name: string;
  models: DeviceModel[];
}

export const DEVICE_DATABASE: Record<DeviceCategory, DeviceBrand[]> = {
  Smartphone: [
    {
      id: "apple",
      name: "Apple",
      models: [
        { id: "iphone_16_pro_max", name: "iPhone 16 Pro Max" },
        { id: "iphone_16_pro", name: "iPhone 16 Pro" },
        { id: "iphone_16_plus", name: "iPhone 16 Plus" },
        { id: "iphone_16", name: "iPhone 16" },
        { id: "iphone_15_pro_max", name: "iPhone 15 Pro Max" },
        { id: "iphone_15_pro", name: "iPhone 15 Pro" },
        { id: "iphone_15_plus", name: "iPhone 15 Plus" },
        { id: "iphone_15", name: "iPhone 15" },
        { id: "iphone_14_pro_max", name: "iPhone 14 Pro Max" },
        { id: "iphone_14_pro", name: "iPhone 14 Pro" },
        { id: "iphone_14_plus", name: "iPhone 14 Plus" },
        { id: "iphone_14", name: "iPhone 14" },
        { id: "iphone_13_pro_max", name: "iPhone 13 Pro Max" },
        { id: "iphone_13_pro", name: "iPhone 13 Pro" },
        { id: "iphone_13", name: "iPhone 13" },
        { id: "iphone_12_pro_max", name: "iPhone 12 Pro Max" },
        { id: "iphone_12_pro", name: "iPhone 12 Pro" },
        { id: "iphone_12", name: "iPhone 12" },
        { id: "iphone_11_pro_max", name: "iPhone 11 Pro Max" },
        { id: "iphone_11_pro", name: "iPhone 11 Pro" },
        { id: "iphone_11", name: "iPhone 11" },
        { id: "iphone_x", name: "iPhone X" },
        { id: "iphone_xr", name: "iPhone XR" },
        { id: "iphone_se", name: "iPhone SE (All Gen)" }
      ]
    },
    {
      id: "samsung",
      name: "Samsung",
      models: [
        { id: "samsung_s25_ultra", name: "Galaxy S25 Ultra" },
        { id: "samsung_s25_plus", name: "Galaxy S25+" },
        { id: "samsung_s25", name: "Galaxy S25" },
        { id: "samsung_s24_ultra", name: "Galaxy S24 Ultra" },
        { id: "samsung_s24_plus", name: "Galaxy S24+" },
        { id: "samsung_s24", name: "Galaxy S24" },
        { id: "samsung_s23_ultra", name: "Galaxy S23 Ultra" },
        { id: "samsung_s23_fe", name: "Galaxy S23 FE" },
        { id: "samsung_s23_plus", name: "Galaxy S23+" },
        { id: "samsung_s23", name: "Galaxy S23" },
        { id: "samsung_s22_ultra", name: "Galaxy S22 Ultra" },
        { id: "samsung_s21_fe", name: "Galaxy S21 FE" },
        { id: "samsung_z_fold_6", name: "Galaxy Z Fold 6" },
        { id: "samsung_z_flip_6", name: "Galaxy Z Flip 6" },
        { id: "samsung_z_fold_5", name: "Galaxy Z Fold 5" },
        { id: "samsung_z_flip_5", name: "Galaxy Z Flip 5" },
        { id: "samsung_a55", name: "Galaxy A55" },
        { id: "samsung_a54", name: "Galaxy A54" },
        { id: "samsung_a34", name: "Galaxy A34" },
        { id: "samsung_m55", name: "Galaxy M55" },
        { id: "samsung_m34", name: "Galaxy M34" }
      ]
    },
    {
      id: "oneplus",
      name: "OnePlus",
      models: [
        { id: "oneplus_12", name: "OnePlus 12" },
        { id: "oneplus_12r", name: "OnePlus 12R" },
        { id: "oneplus_11", name: "OnePlus 11" },
        { id: "oneplus_11r", name: "OnePlus 11R" },
        { id: "oneplus_open", name: "OnePlus Open" },
        { id: "oneplus_nord_4", name: "OnePlus Nord 4" },
        { id: "oneplus_nord_ce_4", name: "OnePlus Nord CE 4" },
        { id: "oneplus_nord_3", name: "OnePlus Nord 3" },
        { id: "oneplus_nord_ce_3", name: "OnePlus Nord CE 3" },
        { id: "oneplus_10_pro", name: "OnePlus 10 Pro" },
        { id: "oneplus_10r", name: "OnePlus 10R" }
      ]
    },
    {
      id: "nothing",
      name: "Nothing",
      models: [
        { id: "nothing_phone_2a", name: "Nothing Phone (2a)" },
        { id: "nothing_phone_2", name: "Nothing Phone (2)" },
        { id: "nothing_phone_1", name: "Nothing Phone (1)" }
      ]
    },
    {
      id: "xiaomi",
      name: "Xiaomi",
      models: [
        { id: "xiaomi_14_ultra", name: "Xiaomi 14 Ultra" },
        { id: "xiaomi_14", name: "Xiaomi 14" },
        { id: "xiaomi_13_pro", name: "Xiaomi 13 Pro" },
        { id: "xiaomi_12_pro", name: "Xiaomi 12 Pro" }
      ]
    },
    {
      id: "redmi",
      name: "Redmi",
      models: [
        { id: "redmi_note_13_pro_plus", name: "Redmi Note 13 Pro+" },
        { id: "redmi_note_13_pro", name: "Redmi Note 13 Pro" },
        { id: "redmi_note_13", name: "Redmi Note 13" },
        { id: "redmi_note_12_pro", name: "Redmi Note 12 Pro" },
        { id: "redmi_12", name: "Redmi 12" }
      ]
    },
    {
      id: "poco",
      name: "POCO",
      models: [
        { id: "poco_x6_pro", name: "POCO X6 Pro" },
        { id: "poco_x6", name: "POCO X6" },
        { id: "poco_f5", name: "POCO F5" },
        { id: "poco_m6_pro", name: "POCO M6 Pro" }
      ]
    },
    {
      id: "realme",
      name: "Realme",
      models: [
        { id: "realme_12_pro_plus", name: "Realme 12 Pro+" },
        { id: "realme_12_pro", name: "Realme 12 Pro" },
        { id: "realme_11_pro", name: "Realme 11 Pro" },
        { id: "realme_gt_5", name: "Realme GT 5" }
      ]
    },
    {
      id: "vivo",
      name: "Vivo",
      models: [
        { id: "vivo_x100_pro", name: "Vivo X100 Pro" },
        { id: "vivo_x100", name: "Vivo X100" },
        { id: "vivo_v30_pro", name: "Vivo V30 Pro" },
        { id: "vivo_v29", name: "Vivo V29" }
      ]
    },
    {
      id: "iqoo",
      name: "iQOO",
      models: [
        { id: "iqoo_12", name: "iQOO 12" },
        { id: "iqoo_neo_9_pro", name: "iQOO Neo 9 Pro" },
        { id: "iqoo_11", name: "iQOO 11" }
      ]
    },
    {
      id: "oppo",
      name: "Oppo",
      models: [
        { id: "oppo_find_x7_ultra", name: "Oppo Find X7 Ultra" },
        { id: "oppo_reno_11_pro", name: "Oppo Reno 11 Pro" },
        { id: "oppo_reno_10", name: "Oppo Reno 10" },
        { id: "oppo_find_n3_flip", name: "Oppo Find N3 Flip" }
      ]
    },
    {
      id: "google",
      name: "Google Pixel",
      models: [
        { id: "pixel_8_pro", name: "Pixel 8 Pro" },
        { id: "pixel_8", name: "Pixel 8" },
        { id: "pixel_8a", name: "Pixel 8a" },
        { id: "pixel_7_pro", name: "Pixel 7 Pro" },
        { id: "pixel_7a", name: "Pixel 7a" },
        { id: "pixel_fold", name: "Pixel Fold" }
      ]
    },
    {
      id: "motorola",
      name: "Motorola",
      models: [
        { id: "moto_edge_50_pro", name: "Motorola Edge 50 Pro" },
        { id: "moto_edge_40_neo", name: "Motorola Edge 40 Neo" },
        { id: "moto_razr_40_ultra", name: "Motorola Razr 40 Ultra" }
      ]
    },
    {
      id: "asus_rog",
      name: "Asus ROG",
      models: [
        { id: "rog_phone_8_pro", name: "ROG Phone 8 Pro" },
        { id: "rog_phone_7", name: "ROG Phone 7" },
        { id: "rog_phone_6", name: "ROG Phone 6" }
      ]
    },
    {
      id: "infinix",
      name: "Infinix",
      models: [
        { id: "infinix_note_40_pro", name: "Infinix Note 40 Pro" },
        { id: "infinix_zero_30", name: "Infinix Zero 30" }
      ]
    },
    {
      id: "other_mobile",
      name: "Other Mobile",
      models: [
        { id: "other", name: "Other Smartphone Model" }
      ]
    }
  ],
  Laptop: [
    {
      id: "apple_laptop",
      name: "Apple",
      models: [
        { id: "macbook_pro_16_m3", name: "MacBook Pro 16 (M3)" },
        { id: "macbook_pro_14_m3", name: "MacBook Pro 14 (M3)" },
        { id: "macbook_air_15_m3", name: "MacBook Air 15 (M3)" },
        { id: "macbook_air_13_m3", name: "MacBook Air 13 (M3)" },
        { id: "macbook_pro_16_m2", name: "MacBook Pro 16 (M2)" },
        { id: "macbook_pro_14_m2", name: "MacBook Pro 14 (M2)" },
        { id: "macbook_air_m2", name: "MacBook Air (M2)" },
        { id: "macbook_air_m1", name: "MacBook Air (M1)" }
      ]
    },
    {
      id: "lenovo_laptop",
      name: "Lenovo",
      models: [
        { id: "lenovo_legion_pro_7", name: "Legion Pro 7 / 7i" },
        { id: "lenovo_legion_pro_5", name: "Legion Pro 5 / 5i" },
        { id: "lenovo_loq_15", name: "Lenovo LOQ 15" },
        { id: "lenovo_loq_16", name: "Lenovo LOQ 16" },
        { id: "lenovo_ideapad_gaming_3", name: "IdeaPad Gaming 3" },
        { id: "lenovo_thinkpad_x1", name: "ThinkPad X1 Carbon" }
      ]
    },
    {
      id: "hp_laptop",
      name: "HP",
      models: [
        { id: "hp_omen_16", name: "HP Omen 16" },
        { id: "hp_victus_15", name: "HP Victus 15" },
        { id: "hp_victus_16", name: "HP Victus 16" },
        { id: "hp_pavilion_aero", name: "Pavilion Aero 13" },
        { id: "hp_spectre_x360", name: "Spectre x360" }
      ]
    },
    {
      id: "dell_laptop",
      name: "Dell",
      models: [
        { id: "alienware_m16", name: "Alienware m16" },
        { id: "alienware_x16", name: "Alienware x16" },
        { id: "dell_g15", name: "Dell G15" },
        { id: "dell_xps_13", name: "Dell XPS 13" },
        { id: "dell_xps_15", name: "Dell XPS 15" }
      ]
    },
    {
      id: "asus_laptop",
      name: "Asus",
      models: [
        { id: "asus_rog_strix_scar", name: "ROG Strix SCAR 16/18" },
        { id: "asus_rog_zephyrus_g14", name: "ROG Zephyrus G14" },
        { id: "asus_rog_zephyrus_g16", name: "ROG Zephyrus G16" },
        { id: "asus_tuf_a15", name: "TUF Gaming A15" },
        { id: "asus_tuf_f15", name: "TUF Gaming F15" },
        { id: "asus_vivobook_pro", name: "Vivobook Pro 15/16X" },
        { id: "asus_zenbook_14", name: "Zenbook 14 OLED" }
      ]
    },
    {
      id: "acer_laptop",
      name: "Acer",
      models: [
        { id: "acer_predator_helios", name: "Predator Helios 16/18" },
        { id: "acer_nitro_5", name: "Nitro 5" },
        { id: "acer_nitro_16", name: "Nitro 16" },
        { id: "acer_swift_x", name: "Swift X" }
      ]
    },
    {
      id: "msi_laptop",
      name: "MSI",
      models: [
        { id: "msi_titan_18", name: "Titan 18 HX" },
        { id: "msi_raider_ge78", name: "Raider GE78" },
        { id: "msi_katana_15", name: "Katana 15" },
        { id: "msi_cyborg_15", name: "Cyborg 15" },
        { id: "msi_modern_14", name: "Modern 14" }
      ]
    },
    {
      id: "razer_laptop",
      name: "Razer",
      models: [
        { id: "razer_blade_14", name: "Razer Blade 14" },
        { id: "razer_blade_16", name: "Razer Blade 16" },
        { id: "razer_blade_18", name: "Razer Blade 18" }
      ]
    },
    {
      id: "other_laptop",
      name: "Other Laptop",
      models: [
        { id: "other", name: "Other Laptop Model" }
      ]
    }
  ],
  Audio: [
    {
      id: "apple_audio",
      name: "Apple",
      models: [
        { id: "airpods_pro_2", name: "AirPods Pro (2nd Gen)" },
        { id: "airpods_3", name: "AirPods (3rd Gen)" },
        { id: "airpods_max", name: "AirPods Max" },
        { id: "airpods_pro_1", name: "AirPods Pro (1st Gen)" }
      ]
    },
    {
      id: "samsung_audio",
      name: "Samsung",
      models: [
        { id: "galaxy_buds_2_pro", name: "Galaxy Buds 2 Pro" },
        { id: "galaxy_buds_fe", name: "Galaxy Buds FE" },
        { id: "galaxy_buds_2", name: "Galaxy Buds 2" },
        { id: "galaxy_buds_live", name: "Galaxy Buds Live" }
      ]
    },
    {
      id: "sony_audio",
      name: "Sony",
      models: [
        { id: "sony_wh_1000xm5", name: "WH-1000XM5 Headphones" },
        { id: "sony_wf_1000xm5", name: "WF-1000XM5 Earbuds" },
        { id: "sony_wh_1000xm4", name: "WH-1000XM4 Headphones" }
      ]
    },
    {
      id: "nothing_audio",
      name: "Nothing",
      models: [
        { id: "nothing_ear_2", name: "Nothing Ear (2)" },
        { id: "nothing_ear_1", name: "Nothing Ear (1)" },
        { id: "nothing_ear_stick", name: "Nothing Ear (stick)" }
      ]
    },
    {
      id: "oneplus_audio",
      name: "OnePlus",
      models: [
        { id: "oneplus_buds_pro_2", name: "OnePlus Buds Pro 2" },
        { id: "oneplus_nord_buds_2", name: "OnePlus Nord Buds 2" }
      ]
    },
    {
      id: "jbl_audio",
      name: "JBL",
      models: [
        { id: "jbl_tour_pro_2", name: "JBL Tour Pro 2" },
        { id: "jbl_live_pro_2", name: "JBL Live Pro 2" }
      ]
    },
    {
      id: "boat_audio",
      name: "Boat",
      models: [
        { id: "boat_airdopes_141", name: "Boat Airdopes 141" },
        { id: "boat_rockerz_450", name: "Boat Rockerz 450" }
      ]
    },
    {
      id: "other_audio",
      name: "Other Audio",
      models: [
        { id: "other", name: "Other Audio Model" }
      ]
    }
  ],
  Tablet: [
    {
      id: "apple_tablet",
      name: "Apple",
      models: [
        { id: "ipad_pro_12_9_m2", name: "iPad Pro 12.9 (M2)" },
        { id: "ipad_pro_11_m2", name: "iPad Pro 11 (M2)" },
        { id: "ipad_air_5", name: "iPad Air (5th Gen)" },
        { id: "ipad_10", name: "iPad (10th Gen)" },
        { id: "ipad_mini_6", name: "iPad Mini (6th Gen)" }
      ]
    },
    {
      id: "samsung_tablet",
      name: "Samsung",
      models: [
        { id: "galaxy_tab_s9_ultra", name: "Galaxy Tab S9 Ultra" },
        { id: "galaxy_tab_s9_plus", name: "Galaxy Tab S9+" },
        { id: "galaxy_tab_s9", name: "Galaxy Tab S9" },
        { id: "galaxy_tab_s9_fe", name: "Galaxy Tab S9 FE" },
        { id: "galaxy_tab_s8", name: "Galaxy Tab S8 Series" },
        { id: "galaxy_tab_a9", name: "Galaxy Tab A9 / A9+" }
      ]
    },
    {
      id: "xiaomi_tablet",
      name: "Xiaomi",
      models: [
        { id: "xiaomi_pad_6", name: "Xiaomi Pad 6" },
        { id: "xiaomi_pad_5", name: "Xiaomi Pad 5" },
        { id: "redmi_pad", name: "Redmi Pad" }
      ]
    },
    {
      id: "lenovo_tablet",
      name: "Lenovo",
      models: [
        { id: "lenovo_tab_p12", name: "Lenovo Tab P12" },
        { id: "lenovo_tab_p11", name: "Lenovo Tab P11" },
        { id: "lenovo_tab_m10", name: "Lenovo Tab M10" }
      ]
    },
    {
      id: "oneplus_tablet",
      name: "OnePlus",
      models: [
        { id: "oneplus_pad", name: "OnePlus Pad" },
        { id: "oneplus_pad_go", name: "OnePlus Pad Go" }
      ]
    },
    {
      id: "other_tablet",
      name: "Other Tablet",
      models: [
        { id: "other", name: "Other Tablet Model" }
      ]
    }
  ]
};
