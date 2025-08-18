const userModel = require("../models/userModel")
const commandeModel = require('../models/commandeModel');
const panierModel = require("../models/panierModel");

const bcrypt = require("bcrypt");


module.exports.getAllUsers = async (req, res) => {
    try {
        //const userList = await userModel.find({age:{$lt:20}}).sort({createdAt:-1}).limit(3).populate("Notifications")
        const userList = await userModel.find().sort("age")

        if (userList.length == 0) {
            throw new Error("Users not found");
        }

        res.status(200).json(userList)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select('_id name username role age email phone image_User');
    if (!user) throw new Error("User not found");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.deleteUserById = async (req, res) => {
    try {
        const { id } = req.params
        const user = await userModel.findByIdAndDelete(id)

        if (!user) {
            throw new Error("User not found");
        }

        res.status(200).json("deleted")
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


module.exports.getUserByEmail = async (req, res) => {
    try {
        const { email } = req.body
        const user = await userModel.find({ email: email })

        if (!user) {
            throw new Error("User not found");
        }

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


module.exports.addClient = async (req, res) => {
    try {
        //const {name , email , password} = req.body()
        const { name, email, password } = req.body
        //console.log("password:",password)
        const roleClient = "client"
        const user = new userModel({
            name, email, password, role: roleClient
        })
        const userAdded = await user.save()
        res.status(200).json(userAdded)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports.addAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body
        //const roleClient = "admin"
        const role = "admin"

        const user = new userModel({
            name, email, password, role
            // name , email , password , role : roleClient
        })
        const userAdded = await user.save()
        res.status(200).json(userAdded)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { age, name, email, role} = req.body
        const user = await userModel.findById(id)
        if (!user) {
            throw new Error("User not found");
        }

        const updated = await userModel.findByIdAndUpdate(
            id,
            {
                $set: { name, age, email, role }
            }
        )

        res.status(200).json(updated)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports.updatePassword = async (req, res) => {
    try {
        const { id } = req.params
        const { newPassword } = req.body
        const user = await userModel.findById(id)
        if (!user) {
            throw new Error("User not found");
        }


        const salt = await bcrypt.genSalt();

        const isSamePassword = await bcrypt.compare(newPassword, user.password)


        const newPasswordhashed = await bcrypt.hash(newPassword, salt);

        /*const confirm = await bcrypt.compare(passwordhashed, user.password)
           console.log(passwordhashed)
           console.log(user.password
        console. log(confirm)
        if (confirm) {
            throw new Error("probleme same password");}*/

        if (isSamePassword) {
            throw new Error("probleme same password");
        }

        const updated = await userModel.findByIdAndUpdate(
            id,
            {
                $set: { password: newPasswordhashed }
            }
        )

        res.status(200).json(updated)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports.addClientWithImg = async (req, res) => {
    try {
        const UserData = { ...req.body, }


        UserData.role = "client"

        if (req.file) {
            const { filename } = req.file;
            UserData.image_User = filename
        }
        const user = new userModel(
            UserData
        )
        const userAdded = await user.save()
        res.status(200).json(userAdded)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

/* module.exports.addToPanier = async (req, res) => {
    try {
        const { userId, ressourceId } = req.body;
        const user = await userModel.findById(userId);
        if (!user || user.role !== "client") {
            throw new Error("Only clients can add to panier");
        }
        const panier = await panierModel.findOne({ client: userId }) || new panierModel({ client: userId, ressources: [] });
        panier.ressources.push(ressourceId);
        await panier.save();
        res.status(201).json(panier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
} */
 module.exports.getClient = async (req, res, next) => {
  try {
    const users = await userModel.find({ role: 'client' })
    if (!users || users.length === 0) {
      res.status(200).json({ message : 'Users not found!' })
    }else {
      res.status(200).json({ users })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports.getAdmin = async (req, res, next) => {
  try {
    const users = await userModel.find({ role: 'admin' })
    if (!users || users.length === 0) {
      throw new Error('Users not found!')
    }
    res.status(200).json({ users })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
} ;
const jwt = require("jsonwebtoken");

const createToken = (id) => {
  return jwt.sign({ id }, "net 9antra25 secret", { expiresIn: "24h" });
};

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    //const user = await userModel.login(email, password);
    //
    const user = await userModel.login(email, password);

    const token = createToken(user._id);
    //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NWZhYzViNWI3MzlkMGZkM2NhZTBjYSIsImlhdCI6MTc1MTEwMTQxMywiZXhwIjoxNzUxMTAxNDczfQ.hpMDmfaICCsaBbCXm1copE7QMK74uRMLPdTt36zQYMc

    await userModel.findByIdAndUpdate({_id: user._id},{connected :true})

    res.cookie("jwt_token", token, { httpOnly: true, maxAge: 3600 * 1000 });
    res
      .status(200)
      .json({ message: "Usersuccessfully authenticated", user: user, user_id: user._id, access_token: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      { _id: req.user._id },
      { connected: false }
    );

    res.cookie("jwt_token", "", { httpOnly: true, maxAge: 1 });
    res.status(200).json({ message: "User successfully logged out" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, age, phone, image_User } = req.body;

    if (!['client', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Role invalide. Doit être 'client' ou 'admin'" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const user = new userModel({ name, email, password, role, age, phone,image_User });
    await user.save();

    const token = createToken(user._id);
    res.cookie("jwt_token", token, { httpOnly: true, maxAge: 3600 * 1000 });
    res.status(201).json({ message: "Utilisateur enregistré avec succès", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

