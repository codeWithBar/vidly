import Joi from "joi";
import moment from "moment";
import mongoose, { Model } from "mongoose";

interface IRental {
  customer: {
    name: string;
    isGold: boolean;
    phone: string;
  };
  movie: {
    title: string;
    dailyRentalRate: number;
  };
  dateOut: Date;
  dateReturned: Date;
  rentalFee: number;
}

interface InstanceMethods {
  calcRentalFee(): void;
}

interface RentalModel extends Model<IRental, {}, InstanceMethods> {
  lookup(
    customerId: mongoose.ObjectId,
    movieId: mongoose.ObjectId
  ): Promise<
    | (mongoose.Document<unknown, {}, IRental> &
        Omit<IRental & { _id: mongoose.Types.ObjectId }, never> &
        InstanceMethods)
    | null
  >;
}

const rentalSchema = new mongoose.Schema<IRental, RentalModel, InstanceMethods>(
  {
    customer: {
      type: new mongoose.Schema({
        name: {
          type: String,
          required: true,
          minlength: 5,
          maxlength: 50,
        },
        isGold: {
          type: Boolean,
          default: false,
        },
        phone: {
          type: String,
          required: true,
          minlength: 5,
          maxlength: 50,
        },
      }),
      required: true,
    },
    movie: {
      type: new mongoose.Schema({
        title: {
          type: String,
          required: true,
          trim: true,
          minlength: 5,
          maxlength: 255,
        },
        dailyRentalRate: {
          type: Number,
          required: true,
          min: 0,
          max: 255,
        },
      }),
      required: true,
    },
    dateOut: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dateReturned: {
      type: Date,
    },
    rentalFee: {
      type: Number,
      min: 0,
    },
  }
);

rentalSchema.static("lookup", function (customerId, movieId) {
  return this.findOne({
    "customer._id": customerId,
    "movie._id": movieId,
  });
});

rentalSchema.method("calcRentalFee", function () {
  this.dateReturned = new Date();
  this.rentalFee =
    moment().diff(this.dateOut, "days") * this.movie.dailyRentalRate;
});

export const Rental = mongoose.model<IRental, RentalModel>(
  "Rental",
  rentalSchema
);

export function validateRental(rental: any) {
  const schema = Joi.object({
    customerId: Joi.string().length(24).required(),
    movieId: Joi.string().length(24).required(),
  });

  return schema.validate(rental);
}
