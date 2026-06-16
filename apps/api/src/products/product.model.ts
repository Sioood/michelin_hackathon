import { Column, DataType, Model, Table } from 'sequelize-typescript'

export type ProductCategory =
  | 'commuting-tour'
  | 'e-bike'
  | 'gravel'
  | 'inner-tubes'
  | 'kids'
  | 'mtb'
  | 'road'

export interface ProductRawData {
  [key: string]: string | number | boolean | null
}

export interface ProductAttributes {
  id?: number
  globalId: string | null
  brand: string
  productType: string
  cycleType: string | null
  cycleTypeWeb: string
  category: ProductCategory
  segment: string | null
  rangeName: string
  internalRange: string | null
  slug: string
  cai: string
  eanCode: string | null
  mspnCode: string | null
  upcCode: string | null
  marketPerimeter: string | null
  designation: string
  internalDesignation: string | null
  webDiameterMm: string | null
  webDiameterInch: string | null
  webWidthMm: string | null
  webWidthInch: string | null
  widthEtrto: string | null
  diameterEtrto: string | null
  rimType: string | null
  bead: string | null
  fitting: string | null
  tpi: string | null
  minPressureBar: number | null
  maxPressureBar: number | null
  minPressurePsi: number | null
  maxPressurePsi: number | null
  recommendedInnerTube: string | null
  sidewallType: string | null
  sidewallColor: string | null
  treadPatternColor: string | null
  labelType: string | null
  useCases: string[]
  terrainTypes: string[]
  technologies: string[]
  rubberTechnologies: string[]
  casingTechnologies: string[]
  treadPatternTechnologies: string[]
  reinforcementTechnologies: string[]
  eBikeTechnologies: string[]
  eBikeReady: boolean
  tubelessReady: boolean
  reflectiveStrip: boolean
  weightG: number | null
  discontinuedDate: string | null
  headline: string
  description: string
  imageKey: string
  rawData: ProductRawData
  createdAt?: Date
  updatedAt?: Date
}

export type ProductSeed = Omit<ProductAttributes, 'createdAt' | 'id' | 'updatedAt'>

@Table({
  tableName: 'products',
  underscored: true,
})
export class Product extends Model<ProductAttributes, ProductSeed> implements ProductAttributes {
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @Column(DataType.STRING(40))
  declare globalId: string | null

  @Column({
    allowNull: false,
    type: DataType.STRING(80),
  })
  declare brand: string

  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  declare productType: string

  @Column(DataType.STRING(80))
  declare cycleType: string | null

  @Column({
    allowNull: false,
    type: DataType.STRING(140),
  })
  declare cycleTypeWeb: string

  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  declare category: ProductCategory

  @Column(DataType.STRING(80))
  declare segment: string | null

  @Column({
    allowNull: false,
    type: DataType.STRING(180),
  })
  declare rangeName: string

  @Column(DataType.STRING(180))
  declare internalRange: string | null

  @Column({
    allowNull: false,
    type: DataType.STRING(220),
    unique: true,
  })
  declare slug: string

  @Column({
    allowNull: false,
    type: DataType.STRING(40),
    unique: true,
  })
  declare cai: string

  @Column(DataType.STRING(40))
  declare eanCode: string | null

  @Column(DataType.STRING(40))
  declare mspnCode: string | null

  @Column(DataType.STRING(40))
  declare upcCode: string | null

  @Column(DataType.STRING(180))
  declare marketPerimeter: string | null

  @Column({
    allowNull: false,
    type: DataType.STRING(260),
  })
  declare designation: string

  @Column(DataType.STRING(260))
  declare internalDesignation: string | null

  @Column(DataType.STRING(40))
  declare webDiameterMm: string | null

  @Column(DataType.STRING(40))
  declare webDiameterInch: string | null

  @Column(DataType.STRING(40))
  declare webWidthMm: string | null

  @Column(DataType.STRING(40))
  declare webWidthInch: string | null

  @Column(DataType.STRING(40))
  declare widthEtrto: string | null

  @Column(DataType.STRING(40))
  declare diameterEtrto: string | null

  @Column(DataType.STRING(80))
  declare rimType: string | null

  @Column(DataType.STRING(80))
  declare bead: string | null

  @Column(DataType.STRING(80))
  declare fitting: string | null

  @Column(DataType.STRING(40))
  declare tpi: string | null

  @Column(DataType.FLOAT)
  declare minPressureBar: number | null

  @Column(DataType.FLOAT)
  declare maxPressureBar: number | null

  @Column(DataType.FLOAT)
  declare minPressurePsi: number | null

  @Column(DataType.FLOAT)
  declare maxPressurePsi: number | null

  @Column(DataType.STRING(180))
  declare recommendedInnerTube: string | null

  @Column(DataType.STRING(120))
  declare sidewallType: string | null

  @Column(DataType.STRING(80))
  declare sidewallColor: string | null

  @Column(DataType.STRING(80))
  declare treadPatternColor: string | null

  @Column(DataType.STRING(80))
  declare labelType: string | null

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING),
  })
  declare useCases: string[]

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING),
  })
  declare terrainTypes: string[]

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING),
  })
  declare technologies: string[]

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING),
  })
  declare rubberTechnologies: string[]

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING),
  })
  declare casingTechnologies: string[]

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING),
  })
  declare treadPatternTechnologies: string[]

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING),
  })
  declare reinforcementTechnologies: string[]

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING),
  })
  declare eBikeTechnologies: string[]

  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataType.BOOLEAN,
  })
  declare eBikeReady: boolean

  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataType.BOOLEAN,
  })
  declare tubelessReady: boolean

  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataType.BOOLEAN,
  })
  declare reflectiveStrip: boolean

  @Column(DataType.INTEGER)
  declare weightG: number | null

  @Column(DataType.STRING(40))
  declare discontinuedDate: string | null

  @Column({
    allowNull: false,
    type: DataType.STRING(180),
  })
  declare headline: string

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  declare description: string

  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  declare imageKey: string

  @Column({
    allowNull: false,
    type: DataType.JSONB,
  })
  declare rawData: ProductRawData
}
