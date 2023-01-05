import { ScalarType } from '@shared/common/configs/prisma'
import { BlockAttribute } from '../attributes/BlockAttribute'
import { EnumModelField } from '../fields/scalarFields/EnumModelField'
import { RelationField } from '../fields/RelationField'
import { BigIntField } from '../fields/scalarFields/BigIntField'
import { BooleanField } from '../fields/scalarFields/BooleanField'
import { BytesField } from '../fields/scalarFields/BytesField'
import { DateTimeField } from '../fields/scalarFields/DateTimeField'
import { DecimalField } from '../fields/scalarFields/DecimalField'
import { FloatField } from '../fields/scalarFields/FloatField'
import { IntField } from '../fields/scalarFields/IntField'
import { JsonField } from '../fields/scalarFields/JsonField'
import { StringField } from '../fields/scalarFields/StringField'
import { PrismaSchemaState } from '../PrismaSchemaState'
import { Block } from './Block'
import { ScalarField } from '../fields/types'

const scalarFieldMap = {
  [ScalarType.STRING]: StringField,
  [ScalarType.INT]: IntField,
  [ScalarType.BOOLEAN]: BooleanField,
  [ScalarType.DATE_TIME]: DateTimeField,
  [ScalarType.FLOAT]: FloatField,
  [ScalarType.DECIMAL]: DecimalField,
  [ScalarType.BIG_INT]: BigIntField,
  [ScalarType.JSON]: JsonField,
  [ScalarType.BYTES]: BytesField
}

export class Model extends Block<ScalarField | RelationField> {
  readonly attributes: BlockAttribute[] = []

  constructor(id: string, state: PrismaSchemaState) {
    super(id, 'model', state)
  }

  _parseLine(line: string, lineIndex: string) {
    const [name, type, ...rest] = line
      .split(' ')
      .filter(Boolean)
      .map((str) => str.trim())

    const typeWithoutModifier = type.replace('[]', '').replace('?', '')

    const ScalarField = scalarFieldMap[typeWithoutModifier as ScalarType]

    if (ScalarField) {
      const scalarField = new ScalarField(name, lineIndex)
      scalarField._parseModifier(type)
      scalarField._parseAttributes(rest)
      this.addField(name, scalarField)
      return
    }

    if (this.state.modelIds.indexOf(typeWithoutModifier) > -1) {
      const relationField = new RelationField(name, lineIndex, typeWithoutModifier)
      relationField._parseAttributes(rest)
      relationField._parseModifier(type)
      this.addField(name, relationField)
      return
    }

    if (this.state.enumIds.indexOf(typeWithoutModifier) > -1) {
      const enumField = new EnumModelField(name, lineIndex, typeWithoutModifier)
      enumField._parseAttributes(rest)
      enumField._parseModifier(type)
      this.addField(name, enumField)
      return
    }
  }
}
