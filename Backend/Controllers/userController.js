const { User } = require("../models/User");
const { Op } = require('sequelize');


const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error:
          "Une erreur s'est produite lors de la récupération des utilisateurs.",
      });
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error:
          "Une erreur s'est produite lors de la récupération de l'utilisateur.",
      });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, role, telephone, cin } = req.body;

    // Validate required fields
    if (!nom || !prenom || !email || !telephone || !cin) {
      return res
        .status(400)
        .json({ error: "Tous les champs sont obligatoires." });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    // Check for duplicate email (excluding current user)
    const duplicateEmail = await User.findOne({
      where: { email, id: { [Op.ne]: id } },
    });
    if (duplicateEmail) {
      return res.status(409).json({ error: "L'adresse e-mail existe déjà." });
    }

    // Check for duplicate CIN (excluding current user)
    const duplicateCin = await User.findOne({
      where: { cin, id: { [Op.ne]: id } },
    });
    if (duplicateCin) {
      return res.status(409).json({ error: "Le CIN existe déjà." });
    }

    await user.update({
      nom,
      prenom,
      email,
      role,
      telephone,
      cin,
    });

    return res.status(200).json({
      message: `Utilisateur ${nom} ${prenom} mis à jour avec succès.`,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error:
          "Une erreur s'est produite lors de la mise à jour de l'utilisateur.",
      });
  }
};


const createUser = async (req, res, next) => {
  try {
    const { nom, prenom, email, password, role, telephone, cin } = req.body;

    // Validate required fields
    if (!nom || !prenom || !email || !password || !telephone || !cin) {
      return res
        .status(400)
        .json({ error: "Tous les champs sont obligatoires." });
    }

    // Check for duplicate email
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res
        .status(409)
        .json({ error: "L'adresse e-mail existe déjà." });
    }

    // Check for duplicate CIN
    const existingCin = await User.findOne({ where: { cin } });
    if (existingCin) {
      return res.status(409).json({ error: "Le CIN existe déjà." });
    }

    // Create new user
    const newUser = await User.create({
      nom,
      prenom,
      email,
      password, // Consider hashing the password before saving
      role: role || "user", // Default role to "user" if not provided
      telephone,
      cin,
    });

    return res.status(201).json({
      message: `Utilisateur ${nom} ${prenom} créé avec succès.`,
      user: {
        id: newUser.id,
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
        role: newUser.role,
        telephone: newUser.telephone,
        cin: newUser.cin,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: "Une erreur s'est produite lors de la création de l'utilisateur.",
      });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    await user.destroy();

    return res.status(200).json({
      message: `Utilisateur supprimé avec succès.`,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error:
          "Une erreur s'est produite lors de la suppression de l'utilisateur.",
      });
  }
};

const getAgents = async (req, res, next) => {
  try {
    const options = {
      where: { role: "agent" },
      attributes: { exclude: ["password"] },
    };
    const agents = await User.findAll(options);
    return res.status(200).json(agents);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: "Une erreur s'est produite lors de la récupération des agents.",
      });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAgents,
  createUser
};
