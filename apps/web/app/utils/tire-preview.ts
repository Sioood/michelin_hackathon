const tirePreviewImages = [
  'https://dxm.contentcenter.michelin.com/api/wedia/dam/transform/b98rpyxf61b4qi9cdjuie1mr5r/bi-134_3528708574090_tire_michelin_wild-enduro-mh-performance-line_29-x-2-point-50_a_main_1-30_nopad.webp?t=resize&height=500',
  'https://dxm.contentcenter.michelin.com/api/wedia/dam/transform/b98rpyxf61b4xxh5ifhzwrhwxr/bi-165_3528706657283_tire_michelin_city-cargo-comp-line_20-x-2-point-40_a_main_1-30_nopad.webp?t=resize&height=500',
  'https://dxm.contentcenter.michelin.com/api/wedia/dam/transform/b98rpyxf61b4qp6e76tzhmhyda/bi-108_3528704906314_tire_michelin_pilot-sx-slick_20-x-1-point-70_a_main_1-30_nopad.webp?t=resize&height=500',
  'https://dxm.contentcenter.michelin.com/api/wedia/dam/transform/b98rpyxf61b4xemgmufmmxfiay/bi-118_3528709010344_tire_michelin_jet-xc-2_29-x-2-point-25_a_main_5-quarterzoom_nopad.webp?t=resize&height=500',
] as const

function hashSeed(seed: string): number {
  let hash = 0

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }

  return hash
}

export function getTirePreviewImage(seed: string): string {
  const index = hashSeed(seed) % tirePreviewImages.length
  return tirePreviewImages[index] ?? tirePreviewImages[0]
}
