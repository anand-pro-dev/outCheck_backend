 
 
const bcryptjs = require('bcryptjs');


const Admin = require('../models/adminModel');

const setupAdmin = async () => {
  const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });

  if (!existingAdmin) {
    const hashedPassword = await bcryptjs.hash("123456A@", 10);
    const newAdmin = new Admin({
      firstName: "Admin",
      lastName: "Account",
      nameprefix: "Mr",
      profilePic:"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      contactNumber:"+199988776655",
      email: "admin@gmail.com",
      password: hashedPassword,
    });

    await newAdmin.save();
    console.log("Admin created: admin@gmail.com | Password: 123456A@");
  } else {
    console.log("Admin already exists");
  }
};

module.exports =    setupAdmin;
