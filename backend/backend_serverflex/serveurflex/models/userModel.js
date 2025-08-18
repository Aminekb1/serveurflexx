const mongoose = require("mongoose");

const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: String,
     /* name: {
        type: String,
        required: [true, 'Name is required'],
        maxlength: [50, 'Names are limited to 50 characters'],
        minlength: [1, 'Invalid name'] }, */
    email: {
      type: String,
      required: true,
      unique:true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minLength: 8,  

     /* validate: {
      validator: function (value) {
         return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)( ?=.*[\W_]).{8,}$/.test(value); 
      }, */
    /*  validate: {
      validator: v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v),
      message:
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un caractere special.", 
      }, */
       /*   match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.",
      ],*/
      validate: {
        validator: v =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]).{8,}$/.test(v),
        message:
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole autorisé.',
      }
    },
   // role: { type: String, enum: ["client", "admin", "moderateur"] },
    role: { type: String, enum: ["client", "admin"] },
    age: Number,
    phone: Number,
    etat: Boolean,
    image_User: { type: String, default: "client.png" },

    //admin
    //client

        //Rleation
    notifications: [{type: mongoose.Schema.Types.ObjectId, ref:"Notification" }], // Many 
   // cars: [{type: mongoose.Schema.Types.ObjectId, ref:"Car" }] // Many 
    //car: {type: mongoose.Schema.Types.ObjectId, ref:"Car" } // one 
    
    panier: {type: mongoose.Schema.Types.ObjectId, ref:"Panier" }, // one 
    commandes: [{type: mongoose.Schema.Types.ObjectId, ref:"Commande" }] ,// Many 
    catalogue: {type: mongoose.Schema.Types.ObjectId, ref:"Catalogue" }, // one 
    recommendationSystem: {type: mongoose.Schema.Types.ObjectId, ref:"RecommendationSystem" }, // one 
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
   //  console.log("User:",User)
    const User = this;
    const salt = await bcrypt.genSalt();
    //console.log("salt :",salt)
    //console.log("test :")
    User.password = await bcrypt.hash(User.password,salt);  
    //console.log("password :",User.password)
    //
    User.etat = false;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    } else {
      throw new Error("incorrect password");
    }
  } else {
    throw new Error("incorrect email");
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;