const mongoose = require('mongoose');
const User = require('./models/User');
const Pet = require('./models/Pet');
const PetItem = require('./models/PetItem');
const Branch = require('./models/Branch'); // assuming you've created a Branch model
const Order = require('./models/Order');

mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const seedDB = async () => {
    // Remove all existing data
    await User.deleteMany({});
    await Pet.deleteMany({});
    await PetItem.deleteMany({});
    await Branch.deleteMany({}); // add this

      // Seed user data
      const password = 'password123';
      const users = [
          { username: "John", password },
          { username: "Jane", password },
          { username: "admin", password:"123"}
      ];

      const savedUsers = await User.insertMany(users);

    // Seed pets data
    const pets = [
        { name: "Cat", breed: "Siamese", image: "/images/cat.jpg" },
        { name: "Dog", breed: "Labrador", image: "/images/dog.jpg" },
        { name: "Parrot", breed: "Macaw", image: "/images/parrot.jpg" },
        { name: "Rabbit", breed: "Holland Lop", image: "/images/rabbit.jpg" }
    ];

    const savedPets = await Pet.insertMany(pets);

    // Seed pet items data
    const petItems = [
        { 
            name: "Dog Toy1s", 
            price: 20, 
            category: "Toys", 
            petId: savedPets[1]._id, 
            image: "/images/dogtoys.jpg",
            description: "Durable toys for playful dogs."
        },
        { 
            name: "Cat Toys", 
            price: 15, 
            category: "Toys", 
            petId: savedPets[0]._id, 
            image: "/images/cattoys.jpg",
            description: "Fun toys for curious cats."
        },
        { 
            name: "Bird Food", 
            price: 10, 
            category: "Food", 
            petId: savedPets[2]._id, 
            image: "/images/birdfood.jpg",
            description: "Nutritious food for chirpy birds."
        },
        { 
            name: "Rabbit Food", 
            price: 15, 
            category: "Food", 
            petId: savedPets[3]._id, 
            image: "/images/rabbitfood.jpg",
            description: "Wholesome food for happy rabbits."
        },
        { 
            name: "Dog Food", 
            price: 25, 
            category: "Food", 
            petId: savedPets[1]._id, 
            image: "/images/dogfood.jpg",
            description: "Balanced diet for healthy dogs."
        },
        { 
            name: "Cat Food", 
            price: 30, 
            category: "Food", 
            petId: savedPets[0]._id, 
            image: "/images/catfood.jpg",
            description: "Tasty and nutritious meals for cats."
        }
    ];
    
    const savedPetItems = await PetItem.insertMany(petItems);

    // Seed branches data
    const branches = [
        { name: "Tel Aviv Branch", lat: 32.1093, lon: 34.8555 },
        { name: "Haifa Branch", lat: 32.7940, lon: 34.9896 },
        { name: "Be'er Sheva Branch", lat: 31.2529, lon: 34.7915 }
    ];

    await Branch.insertMany(branches); // add this
// Seed orders data
const orders = [
    {isOrdered:true, username: savedUsers[0].username, orderedItems: [savedPetItems[0]._id, savedPetItems[2]._id], totalPrice: savedPetItems[0].price + savedPetItems[2].price, orderDate: new Date(2023, 2, 10) },
    {isOrdered:true, username: savedUsers[0].username, orderedItems: [savedPetItems[1]._id, savedPetItems[3]._id], totalPrice: savedPetItems[1].price + savedPetItems[3].price, orderDate: new Date(2023, 2, 20) },
    { isOrdered:true,username: savedUsers[1].username, orderedItems: [savedPetItems[4]._id, savedPetItems[5]._id], totalPrice: savedPetItems[4].price + savedPetItems[5].price, orderDate: new Date(2023, 1, 5) },
    {isOrdered:true, username: savedUsers[1].username, orderedItems: [savedPetItems[0]._id, savedPetItems[1]._id], totalPrice: savedPetItems[0].price + savedPetItems[1].price, orderDate: new Date(2023, 1, 15) }
];

await Order.insertMany(orders);

console.log('Database seeded!');
}

seedDB().then(() => {
    mongoose.connection.close();
});
