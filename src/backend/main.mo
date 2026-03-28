import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Authorization "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = Authorization.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Product Types
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    sizes : [Text];
    imageUrl : Text;
    inStock : Bool;
    createdAt : Int;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  // Order Types
  type OrderItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    price : Nat;
    size : Text;
  };

  type OrderType = {
    id : Nat;
    customerName : Text;
    customerEmail : Text;
    customerPhone : Text;
    shippingStreet : Text;
    shippingCity : Text;
    shippingState : Text;
    shippingZip : Text;
    shippingCountry : Text;
    orderNotes : Text;
    items : [OrderItem];
    totalAmount : Nat;
    status : Text;
    stripePaymentIntentId : Text;
    createdAt : Int;
    orderNumber : Nat;
  };

  module OrderType {
    public func compare(o1 : OrderType, o2 : OrderType) : Order.Order {
      Nat.compare(o1.id, o2.id);
    };
  };

  // Customer Types
  type Customer = {
    name : Text;
    email : Text;
    phone : Text;
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
    country : Text;
  };

  // Identifiers
  var nextProductId = 30;
  var nextOrderId = 1;
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, OrderType>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Products
  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) {
        p.category == category;
      }
    ).sort();
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let newProduct = {
      product with
      id = nextProductId;
      createdAt = Time.now();
    };
    products.add(nextProductId, newProduct);
    nextProductId += 1;
  };

  public shared ({ caller }) func updateProduct(id : Nat, updatedProduct : Product) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    let existingProduct = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
    let newProduct = {
      existingProduct with
      name = updatedProduct.name;
      description = updatedProduct.description;
      price = updatedProduct.price;
      category = updatedProduct.category;
      sizes = updatedProduct.sizes;
      imageUrl = updatedProduct.imageUrl;
      inStock = updatedProduct.inStock;
    };
    products.add(id, newProduct);
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.remove(id);
  };

  // Orders
  public shared ({ caller }) func createOrder(order : OrderType) : async Nat {
    let newOrder = {
      order with
      id = nextOrderId;
      createdAt = Time.now();
      status = "Pending";
      orderNumber = nextOrderId;
    };
    orders.add(nextOrderId, newOrder);
    let orderId = nextOrderId;
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getOrderById(id : Nat) : async ?OrderType {
    orders.get(id);
  };

  public query ({ caller }) func getAllOrders() : async [OrderType] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray().sort();
  };

  public query ({ caller }) func getOrdersByEmail(email : Text) : async [OrderType] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can search orders by email");
    };
    orders.values().toArray().filter(
      func(o) {
        o.customerEmail == email;
      }
    ).sort();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : Text) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    let existingOrder = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
    let updatedOrder = {
      existingOrder with
      status = newStatus;
    };
    orders.add(orderId, updatedOrder);
  };

  // Customers
  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all customers");
    };
    let emailSet = Set.empty<Text>();

    let customers = orders.values().toArray().filter(
      func(order) {
        if (emailSet.contains(order.customerEmail)) {
          false;
        } else {
          emailSet.add(order.customerEmail);
          true;
        };
      }
    ).map(
      func(order) {
        {
          name = order.customerName;
          email = order.customerEmail;
          phone = order.customerPhone;
          street = order.shippingStreet;
          city = order.shippingCity;
          state = order.shippingState;
          zip = order.shippingZip;
          country = order.shippingCountry;
        };
      }
    );
    customers;
  };

  // Legacy stable variables (kept for upgrade compatibility)
  var razorpayKeyId : Text = "";
  var stripeConfiguration : ?{secretKey : Text; allowedCountries : [Text]} = null;

  // UPI Configuration
  var upiId : Text = "9540975954@fam";

  public query func isPaymentConfigured() : async Bool {
    upiId != "";
  };

  public shared ({ caller }) func setUpiId(id : Text) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    upiId := id;
  };

  public query func getUpiId() : async Text {
    upiId;
  };

  // Pre-seed products
  func seedProducts() {
    let initialProducts = [
      {
        id = 1;
        name = "White Cotton T-Shirt";
        description = "Classic white t-shirt made from 100% cotton. Comfortable and versatile for any occasion.";
        price = 45000;
        category = "Men";
        sizes = ["S", "M", "L", "XL"];
        imageUrl = "https://cmprs.ik-pp-wb.cloud/static/assets/uploads/articles/f799a-addittoit-fashion-wbs-eng-12-16.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 2;
        name = "Black Crew Neck T-Shirt";
        description = "Sleek black t-shirt with crew neck design. Perfect for casual or layered looks.";
        price = 48000;
        category = "Men";
        sizes = ["S", "M", "L", "XL"];
        imageUrl = "https://contents.mediadecathlon.com/m944306/e17888e98b81f9836b3c95891d7b1c0a/p1662427.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 3;
        name = "Men's Slim Fit Jeans";
        description = "Classic blue jeans with a modern slim fit. Durable and comfortable for everyday wear.";
        price = 78000;
        category = "Men";
        sizes = ["30", "32", "34", "36"];
        imageUrl = "https://5.imimg.com/data5/SC/UX/MY-911826/men-jeans-500x500.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 4;
        name = "Men's Leather Belt";
        description = "High-quality genuine leather belt. Stylish accessory for any outfit.";
        price = 40000;
        category = "Accessories";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://cdn11.bigcommerce.com/s-f6d8b/images/stencil/1280x1280/products/16305/35374/AW29158__17209.1453970865.jpg?c=2";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 5;
        name = "Men's Casual Shirt";
        description = "Lightweight casual shirt perfect for outings or work. Breathable fabric for all-day comfort.";
        price = 55000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://arilje.net/wp-content/uploads/2022/08/kosulja-u-prugama-ARTELIER-1.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 6;
        name = "Men's Dress Shirt";
        description = "Premium dress shirt for formal occasions. Sharp and tailored fit.";
        price = 65000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://ivymoda.com/files/news/2022/03/22/sz%2071a-1647912112.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 7;
        name = "Men's Chinos";
        description = "Versatile chinos for smart-casual style. Comfortable fit with stretch fabric.";
        price = 70000;
        category = "Men";
        sizes = ["30", "32", "34", "36"];
        imageUrl = "https://cdnmedia.uniqlo.com/goods/432219/item/54_432219_middles.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 8;
        name = "Men's Black Leather Wallet";
        description = "Sleek black wallet made from genuine leather. Perfect accessory for any man.";
        price = 35000;
        category = "Accessories";
        sizes = [];
        imageUrl = "https://www.svatavafashion.cz/user/documents/upload/user/images/v%C3%BDrobky_2022/2022_401PBLACK.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 9;
        name = "Men's Hoodie";
        description = "Comfortable hoodie ideal for lounging or casual wear. Warm and soft fabric.";
        price = 58000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://img.fruugo.com/product/5/00/15057005_max.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 10;
        name = "Men's Bomber Jacket";
        description = "Stylish bomber jacket for a modern look. Lightweight and comfortable.";
        price = 120000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/b326c1c8f472ce848644172336d4a704.jpg?imageView2/2/w/800/q/70";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 11;
        name = "Men's Sunglasses";
        description = "Trendy sunglasses for sun protection and style. UV-blocking lenses.";
        price = 28000;
        category = "Accessories";
        sizes = [];
        imageUrl = "https://luxelure.com/cdn/shop/products/luxelure_oval_mens_sunglasses_Y5320_black_black_9e9089c3-f092-4ead-80c5-2c0acd13f200_1024x1024.jpg?v=1653467849";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 12;
        name = "Men's Dress Pants";
        description = "Tailored dress pants for formal events or office wear. Quality craftsmanship.";
        price = 76000;
        category = "Men";
        sizes = ["30", "32", "34", "36"];
        imageUrl = "https://media.karafarinapi.com/digikala/KF16130685/1beeb99f77d843d9b7ea9a155a367c1e.jpeg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 13;
        name = "Men's Casual Cap";
        description = "Casual cotton cap suitable for outdoor activities. Comfortable and durable.";
        price = 22000;
        category = "Accessories";
        sizes = [];
        imageUrl = "https://5.imimg.com/data5/ANDROID/Default/2021/9/PA/QG/WI/24005898/product-jpeg-500x500.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 14;
        name = "Men's Slim Fit Shirt";
        description = "Sharp slim-fit shirt ideal for business or casual occasions. Perfect fit.";
        price = 60000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://a-static.mlcdn.com.br/1500x1500/camisa-masculina-slim-social-fimith-premium-fimith/fimithpremium/3026-azulpastel/7108b06b5e8a3368c588bf626079cf99.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 15;
        name = "Men's Crew Neck Sweater";
        description = "Cozy crew neck sweater for cooler weather. Soft and comfortable material.";
        price = 75000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://th.bing.com/th/id/OIP.9AP2Sh7nZlw2-iGAV9u5EwAAAA?rs=1&pid=ImgDetMain";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 16;
        name = "Men's Blazer";
        description = "Classic blazer for formal or business attire. Timeless style and elegance.";
        price = 185000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://th.bing.com/th/id/OIP.wNVU8INj7cuVPHB26SI00AHaHa?rs=1&pid=ImgDetMain";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 17;
        name = "Men's Oxford Shirt";
        description = "Oxford-style shirt for work or casual settings. Versatile and comfortable.";
        price = 58000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://th.bing.com/th/id/OIP.NwzwkGycu4kwTb4NKMj7YQAAAA?rs=1&pid=ImgDetMain";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 18;
        name = "Men's Winter Coat";
        description = "Warm and insulated winter coat. Perfect for cold weather protection.";
        price = 240000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://resources.clothingwarehouse.com/img/G4517B_BLACK.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 19;
        name = "Men's Leather Watch";
        description = "Elegant leather watch with modern design. A timeless accessory.";
        price = 125000;
        category = "Accessories";
        sizes = [];
        imageUrl = "https://cdn.webshopapp.com/shops/163285/files/401441127/1200x1600x2/ice-watch-leather-navy-mens-band-strap-watch-019757.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 20;
        name = "Men's Polo Shirt";
        description = "Classic polo shirt for smart-casual style. Comfortable fit and quality fabric.";
        price = 48000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://www.olymp.com/dw/image/v2/BJLB_PRD/on/demandware.static/-/Sites-master-catalog-Olymp/default/dwf80d47be/images/olymp/pdp_images/000/313/63/1/000-313631-18-p000.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 21;
        name = "Men's Leather Boots";
        description = "Durable leather boots suitable for work or outdoor activities. Stylish and rugged.";
        price = 115000;
        category = "Men";
        sizes = ["9", "10", "11", "12"];
        imageUrl = "https://th.bing.com/th/id/OIP.dnpCdNzDBrWp_p2FaYQVKgHaHa?rs=1&pid=ImgDetMain";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 22;
        name = "Men's Tracksuit";
        description = "Comfortable tracksuit for workouts or lounging. Breathable and stylish.";
        price = 70000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://assets.asosservices.com/generatedrsimages/subcatheader_fw18_1323x525_2600835471.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 23;
        name = "Men's Ankle Socks (4 Pack)";
        description = "Set of 4 pairs of cotton ankle socks. Classic style for everyday wear.";
        price = 32000;
        category = "Accessories";
        sizes = [];
        imageUrl = "https://mirapodo-static.mirapodo.net/media/image/ce/94/99/cereslife_socken_dunkelgrau_grau_0918194_400x.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 24;
        name = "Men's Running Shoes";
        description = "Lightweight running shoes with cushioned soles. Comfortable for exercise or casual wear.";
        price = 98000;
        category = "Men";
        sizes = ["9", "10", "11", "12"];
        imageUrl = "https://i5.walmartimages.com/asr/c95720ae-db67-4dc2-9a3b-2fbef12be740_1.26812c91b6c5da606e1ad45de1e7ae03.jpeg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 25;
        name = "Men's Backpack";
        description = "Stylish and durable backpack for work or travel. Plenty of storage space.";
        price = 62000;
        category = "Accessories";
        sizes = [];
        imageUrl = "https://aliava.com/wp-content/uploads/2024/02/80ddaeaee5db5c911c2ee473b187c090-1.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 26;
        name = "Men's Casual Shorts";
        description = "Lightweight shorts for warm weather. Comfortable and stylish for everyday use.";
        price = 46000;
        category = "Men";
        sizes = ["30", "32", "34", "36"];
        imageUrl = "https://th.bing.com/th/id/OIP.7rQgM4bSyCv9ohB5Bf9ytQHaKx?rs=1&pid=ImgDetMain";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 27;
        name = "Men's Tie Set (3 Pack)";
        description = "Set of 3 stylish ties suitable for formal and business attire.";
        price = 43000;
        category = "Accessories";
        sizes = [];
        imageUrl = "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/55b2287de4426773aba86e46c4933abf.jpg?imageView2/2/w/800/q/70";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 28;
        name = "Men's Rain Jacket";
        description = "Water-resistant rain jacket, lightweight and perfect for unpredictable weather.";
        price = 85000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://www.intersport.fr/on/demandware.static/-/Sites-fr-master-catalog/default/dwd50c5790/images/2289473_1.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 29;
        name = "Men's Dress Gloves";
        description = "Elegant leather gloves for formal occasions. Warm and stylish for colder weather.";
        price = 54000;
        category = "Accessories";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://www.stlfashionhouse.com/cdn/shop/products/21W25401-1.jpg";
        inStock = true;
        createdAt = Time.now();
      },
      {
        id = 30;
        name = "Men's Sweater Vest";
        description = "Classic sweater vest, ideal for layering during the colder months. Timeless style.";
        price = 67000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        imageUrl = "https://i5.walmartimages.com/asr/a58dd167-13b8-4e31-9bfb-96c84ff02875.9135fbd9fdaea90330688bbf0686e5e5.jpeg";
        inStock = true;
        createdAt = Time.now();
      },
    ];
    for (product in initialProducts.values()) {
      products.add(product.id, product);
    };
  };

  seedProducts();
};
