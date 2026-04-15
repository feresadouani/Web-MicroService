import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ReclamationStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

@Schema({
  collection: 'reclamation',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Reclamation {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' })
  status!: ReclamationStatus;

  /** Sujet Keycloak (sub) de l’utilisateur qui a créé la réclamation */
  @Prop({ required: true, trim: true, maxlength: 128 })
  authorSub!: string;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export type ReclamationDocument = HydratedDocument<Reclamation>;
export const ReclamationSchema = SchemaFactory.createForClass(Reclamation);
