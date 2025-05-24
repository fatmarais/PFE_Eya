const { User } = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleNewUser = async (req, res, next) => {
  try {
    console.log("req.body", req.body);
    const { nom, prenom, email, password, role, telephone, cin } = req.body;

    // Validate required fields
    if (!nom || !prenom || !email || !password || !telephone || !cin) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    // Check for duplicate email in the database
    const duplicateEmail = await User.findOne({ where: { email } });
    if (duplicateEmail) {
      return res.status(409).json({ error: "L'adresse e-mail existe déjà." });
    }

    // Check for duplicate CIN in the database
    const duplicateCin = await User.findOne({ where: { cin } });
    if (duplicateCin) {
      return res.status(409).json({ error: "Le CIN existe déjà." });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const result = await User.create({
      nom,
      prenom,
      email,
      password: hashedPassword, // Use hashed password
      role,
      telephone,
      cin,
    });

    console.log(result);
    return res.status(201).json({ message: `Nouvel utilisateur ${nom} ${prenom} créé !` });
  } catch (err) {
    console.error(err); // Log error for debugging
    return res.status(500).json({ error: "Une erreur s'est produite lors de la création de l'utilisateur." });
  }
};

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "L'email et le mot de passe sont obligatoires." });
    }

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Adresse e-mail ou mot de passe incorrect." });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Adresse e-mail ou mot de passe incorrect." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
      process.env.JWT_SECRET, // Make sure you have this secret defined in your .env file
      { expiresIn: '1h' } // Token expiration time
    );

    return res.status(200).json({ 
      message: "Connexion réussie.",
      token, 
      user: { id: user.id, nom: user.nom, prenom: user.prenom, role: user.role, email: user.email, telephone: user.telephone, cin: user.cin }
    });
  } catch (err) {
    console.error(err); // Log error for debugging
    return res.status(500).json({ error: "Une erreur s'est produite lors de la connexion." });
  }
};
module.exports = { handleNewUser, handleLogin };
