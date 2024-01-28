const mongoose = require('mongoose');
const { Product } = require('../models/productShema');
const { Category } = require('../models/CategorySchema');
const { CategoryOffer } = require('../models/categoryOfferSchema');
const jwt = require('jsonwebtoken');


const getCategory = async function () {
    try {
      const categories = await Category.find({active: true});
      if (categories.length > 0) {
        return categories;
      } else {
        throw new Error("Couldn't find categories");
      }
    } catch (error) {
      console.log(error.message);
    }
};

let productOfferError = '';

module.exports.categoryPage = async(req,res) =>{
    try{
        const category = await Category.find({});
    
        const toastMessage = '';
        const categoryOffer = await CategoryOffer.find();
       
        res.render('admin/category', {category: category, toastMessage })
    }catch(error){
        console.log(error.message)
    }
}

module.exports.addCategory =async (req,res) => {
    try{
        const newCategory = req.body.category;
 const added = new Category({
    categoryName : newCategory
 })
 const saved = await added.save();

 const category = await Category.find({});

       if(saved){ 
       
        const toastMessage = 'Category added successfully!';

        
        res.render('admin/category', {category: category, toastMessage })
}else{
    res.status(404).send('Category is not added.....')
}


    }catch(error){
        console.log(error.message)
    }
}

module.exports.deactivateCategory =async (req,res) => {
    try{
const id = req.params.id

const category = await Category.findByIdAndUpdate({_id:id},{$set:{active:false}})
if(category){
    res.redirect('/admin/category')
}
    }catch(error){
        console.log(error.message)
    }
}

module.exports.activateCategory =async (req,res) => {
    try{
const id = req.params.id

const category = await Category.findByIdAndUpdate({_id:id},{$set:{active:true}})
if(category){
    res.redirect('/admin/category')
}
    }catch(error){
        console.log(error.message)
    }
}

module.exports.addCategoryOfferPage = async (req, res) => {
    try {
        const category = await getCategory();
        const id = req.params.id;
        const categoryName = await Category.findOne({_id: id})
        // console.log(categoryOffers, "😊");

        
        res.render("admin/category-offer", { category, categoryName: categoryName });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports.addCategoryOffer = async (req, res) => {
  try {
      const id = req.params.id;
      console.log(id);

      let perc = parseInt(req.body.offerPercentage);

      const updatedCategory = await Category.findByIdAndUpdate(id, {
          $set: {
              categoryOffer: perc
          }
      });

      const products = await Product.find({ category: id }).populate('category');
      console.log(products);

      if (perc === 0) {
          for (let i = 0; i < products.length; i++) {
              products[i].price = products[i].mrp;
              products[i].offerGot = 0;
              products[i].realPrice = 0;
              products[i].discount_percentage = 0;
              await products[i].save();
          }
      } else {
          for (let i = 0; i < products.length; i++) {
              products[i].offerGot = products[i].mrp / 100 * perc;
              products[i].price = products[i].mrp - products[i].offerGot;
              products[i].realPrice = products[i].mrp;
              products[i].discount_percentage = perc;
              await products[i].save();
          }
      }

      res.redirect('/admin/category');
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
  }
};



module.exports.deleteCategoryOffer = async (req, res) => {
  try {
    const id = req.params.id;

    console.log(id)

    // Use await to wait for the deletion operation to complete
    const deleteOffer = await CategoryOffer.deleteOne({ _id: id });

    if (deleteOffer.deletedCount > 0) {
      res.redirect('/admin/category-offer-page');
    } else {
      res.send('Error deleting category offer. Category offer not found.');
    }
  } catch (error) {
    console.log(error.message);
    res.send('Error deleting category offer.');
  }
};

module.exports.editCategoryPage = async(req,res) =>{
    try{
const category = await Category.findById(req.params.id);
if(!category){
    console.log('error while loading category');
}else{
    res.render('admin/editcategory',{category:category})
}

    }catch(error){
        console.log(error.message)
    }
}

module.exports.editCategory = async(req,res) =>{
    try{

      const category = await Category.findByIdAndUpdate({_id:req.params.id},
        {$set:
            {categoryName:req.body.category
            }
        })
      if(category){
        res.redirect('/admin/category')
    }

    }catch(error){
        console.log(error.message)
    }
} 

module.exports.productListPage = async(req,res) => {
    try{
      
      const products = await Product.find({deleted:false})
      const category = await Product.find().populate('category')
    res.render('admin/adminhome',{category,product:products})
    }catch(error){
        console.log(error.message)
    }
}
 //Product page pagination

module.exports.adminProductPaginate =  async (req, res) => {
  try {
    const { page, pageSize } = req.body;
    const skip = (page - 1) * pageSize;
    const products = await Product.find({deleted:false})
      .skip(skip)
      .limit(pageSize);

      const populatedProducts = await Promise.all(
        products.map(async (product) => {
          const category = await Category.findById(product.category);
          return { ...product.toObject(), category: category }; // Combine product and category information
        })
      );
  

    res.json({ products:populatedProducts });
  } catch (error) {
    console.error('Error fetching paginated data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports.addProductPage = async (req,res) =>{
    try{
 const category = await Category.find()

 const toastMessage = req.query.toastMessage;

res.render('admin/addproduct',{category:category,toastMessage})
    }catch(error){
        console.log(error.message);
    }
};

module.exports.addProduct = async (req, res) => {
    try {
        const images = req.files.map((file)=> ({ url: file.filename}))
        const newproduct = new Product({
            title: req.body.title,
            category: req.body.category,
            desc: req.body.desc,
            size: req.body.size,
            images: images,
            stock: req.body.stock,
            price:req.body.price,
            mrp: req.body.price
        });
  
      const savedProduct = await newproduct.save();
      console.log(savedProduct);


      let toastMessage = 'Product Added Successfully'

      if (!savedProduct) {
        res.status(500).send('Cannot create product!...');
      } else {
         
        res.redirect('/admin/add-product-Page?toastMessage=' + encodeURIComponent(toastMessage));
      }
    } catch (error) {
      console.log(error.message);
    }
};

module.exports.editProductPage = async (req,res) => {
    try{
     const productId = req.params.productId;   
     const product = await Product.findOne({_id:productId})
     const category = await Category.find();  
     console.log(product);
        res.render('admin/editproduct',{product:product,category:category});

    }catch(error){
        console.log(error.message)
    }
};

module.exports.updateProduct = async (req,res) => {
    try {
        const productId = req.params.productId;
        if (!productId) {
          return res.status(400).send("Invalid product ID");
        }
    
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
          return res.status(404).send("Product not found");
        }
    
        let newImages = [];
    
        if (req.files && req.files.length > 0) {
          newImages = req.files.map(file => ({ url: file.filename }));
          
          try {
            existingProduct.images.forEach(image => {
              const imagePath = path.join(__dirname, '../public/uploads/', image.url);
              fs.unlinkSync(imagePath);
            });
          } catch (err) {
            console.log("Error deleting existing images:", err);
          }
        }
    
        const newData = await Product.updateOne(
          { _id: productId },
          {
            title: req.body.title,
            category: req.body.category,
            price: req.body.price,
            desc: req.body.desc,
            images: newImages.length > 0 ? newImages : existingProduct.images,
            stock: req.body.stock,
          }
        );
    
        console.log(newData);
    
        res.redirect("/admin/adminhome");
      } catch (error) {
        console.log('Try catch error in updateProduct 🤷‍♂️📀🤷‍♀️');
        console.log(error.message);
      }
}


module.exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    if (req.query.confirmation === 'true') {
      const deleteProduct = await Product.findByIdAndUpdate(
        { _id: productId },
        {
          $set: {
            deleted: true
          }
        },
        { new: true }
      );

      console.log(deleteProduct);

      if (deleteProduct) {
        res.redirect('/admin/adminhome');
      } else {
        console.log('Error deleting product');
        res.redirect('/admin/adminhome');
      }
    } else {
      console.log('Deletion canceled by user');
      res.redirect('/admin/adminhome');
    }
  } catch (error) {
    console.log(error.message);
    res.redirect('/admin/adminhome');
  }
};



module.exports.ProductOfferPage = async(req,res)=>{
  try {
    const id = req.params.id;

    const product = await Product.findOne({_id: id});
    productOfferError = ''

    const products = await Product.find({});
    
    res.render('admin/add-product-offer', {product: product, err: productOfferError, products: products });

  } catch (error) {
    console.log(error.message);
  }
}






module.exports.addProductOffer = async (req, res) => {
  try {
    const id = req.params.id;
    const percent = parseInt(req.body.offerPercentage);

    if (isNaN(percent)) {
      console.log('Parsed offer percentage:', percent);
    console.log('Invalid offer percentage:', req.body.offerPercentage + "😆" + req.body.name);
      console.log('Invalid offer percentage:', req.body.offerPercentage);
      return res.status(400).send('Invalid offer percentage');
      
    
    }

    if(percent === 0){
      const addOffer = await Product.findByIdAndUpdate(
        id,
        {
          $set: {
            title: req.body.name,
            productOffer: percent,
          },
        },
        { new: true } // This option returns the updated document
      );

      if (addOffer) {
        // Check if the offer has already been applied, adjust this condition based on your logic
      
          addOffer.price = addOffer.realPrice;
          addOffer.offerGot = 0
          addOffer.realPrice = 0
          const saved = await addOffer.save();
  
          if (saved) {
            res.redirect('/admin/adminhome');
          } else {
            console.log('Error adding a new offer for the product');
            res.send('error');
          }
        
      }



    }else{
      
    const addOffer = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          title: req.body.name,
          productOffer: percent,
        },
      },
      { new: true } // This option returns the updated document
    );

    if (addOffer) {
      // Check if the offer has already been applied, adjust this condition based on your logic
      if (addOffer.realPrice < 1) {
        addOffer.realPrice = addOffer.price;
        addOffer.offerGot = addOffer.realPrice * percent / 100;
        addOffer.price = addOffer.realPrice - addOffer.offerGot

        const saved = await addOffer.save();

        if (saved) {
          res.redirect('/admin/adminhome');
        } else {
          console.log('Error adding a new offer for the product');
          res.send('error');
        }
      } else {
        const productOfferError = 'Already applied category offer';
        res.render('admin/add-product-offer', { product: addOffer, err: productOfferError });
      }
    }
    }


  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};







//<--------------------------------User---------------------------------------->


 //List Products CategoryWise
module.exports.listProductsPage = async (req, res) => {
    try {
        const userId = req.session.user;
        const categoryId = req.query.id;

        console.log(categoryId);

        const products = await Product.find({ category: categoryId,deleted:false }).populate('category');
        const category = await getCategory();

        console.log(products);

        res.render('user/listProduct', { product: products, category, user: userId });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

// Sort and Filter
module.exports.productFilter = async (req, res) => {
    try {
    
      const price = req.body.price;
      const id = req.body.category;
  
      console.log(price         + "            "  + id);
  
      const product =   await Product.find({})
  
     
      let products = [];
    
      
  
      if(price !== undefined && id === undefined && id !== 'all'){
        if(price <= 1000){
          products = product.filter((value)=> value.price >= 100 && value.price <= 1000);
        }else if(price <= 2000){
          products = product.filter((value)=> value.price >= 1000 && value.price <= 2000);
        }else if(price <= 3000){
          products = product.filter((value)=> value.price >= 2000 && value.price <= 3000);
        }else if(price <= 4000){
          products = product.filter((value)=> value.price >= 3000 && value.price <= 4000);
        }else if(price <= 5000){
          products = product.filter((value)=> value.price >= 4000 && value.price <= 5000);
        }   
        res.send({ products: products });
  console.log("h00000000000000000000000000000iiiiiiiiiiiiiiiiiiiiiiiii")
      }else if(price !== undefined && id !== undefined && id !== 'all'){
        const productCat = await Product.find({ category: id }).populate("category");
  
  
        if(price <= 1000){
          products = productCat.filter((value)=> value.price >= 100 && value.price <= 1000);
        }else if(price <= 2000){
          products = productCat.filter((value)=> value.price >= 1000 && value.price <= 2000);
        }else if(price <= 3000){
          products = productCat.filter((value)=> value.price >= 2000 && value.price <= 3000);
        }else if(price <= 4000){
          products = productCat.filter((value)=> value.price >= 3000 && value.price <= 4000);
        }else if(price <= 5000){
          products = productCat.filter((value)=> value.price >= 4000 && value.price <= 5000);
        }
        console.log("heeeeeeeeeeeeeeeeyyyyyyyyyy");
        res.send({ products: products });
  
  
      }else if (price === undefined && id !== undefined && id !== 'all') {
      const productCat = await Product.find({ category: id }).populate("category");

        
        products = productCat;
        console.log("helllllllllllllllllllllllloooooooooooooooooooo");
        res.send({ products: products });
      }else if(id === 'all'  && price === undefined){
        products  = await Product.find({})

        console.log("All productsssssssssss");
        res.send({ products: products });
      }
      
  
    } catch (error) {
      console.log(error.message);
      console.log('try cach error in filterProductAjax 🤷‍♂️📀🤷‍♀️')
    }
};
  

module.exports.productSearch = async (req, res) => {
  try {
    let search = req.body.search.trim();

    console.log(search)

    // Use 'exec()' instead of 'exce()'
    let productSearch = await Product.find({
      title: { $regex: new RegExp('^' + search, 'i') }
    }).exec();

    // Limit the results to the first 10
    productSearch = productSearch.slice(0, 10);

    console.log(productSearch);
    res.json({ search: productSearch }); // Use 'res.json()' to send a JSON response
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' }); // Return an appropriate error response
  }
};

module.exports.productPaginate =  async (req, res) => {
  try {
    const { page, pageSize } = req.body;
    const skip = (page - 1) * pageSize;
    const products = await Product.find({ deleted: false })
      .skip(skip)
      .limit(pageSize);

    res.json({ products });
  } catch (error) {
    console.error('Error fetching paginated data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};








