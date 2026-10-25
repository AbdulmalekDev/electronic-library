import { connect } from 'mongoose';
import bcrypt from 'bcryptjs';
// import User, { deleteMany } from '../models/User.js';
// import Book, { deleteMany as _deleteMany } from '../models/Book.js';
// import LibraryInfo, { deleteMany as __deleteMany } from '../models/LibraryInfo.js';
import LibraryInfo from '../models/LibraryInfo.js';
import User from '../models/User.js';
import Book from '../models/Book.js';

import dotenv from 'dotenv';

dotenv.config();
// require('dotenv').config();

// Connect to database
console.log("Mongo URI:", process.env.MONGODB_URI);
connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Clear existing data
    // await deleteMany({});
    // await _deleteMany({});
    // await __deleteMany({});
    await User.deleteMany({});
await Book.deleteMany({});
await LibraryInfo.deleteMany({});


    console.log('🌱 Seeding database...');

    // Create admin user
    const adminUser = new User({
      fullName: 'مدير النظام',
      username: 'admin',
      email: 'admin@library.com',
      password: 'admin123',
      role: 'admin',
      job: 'مدير المكتبة'
    });
    await adminUser.save();
    console.log('✅ Admin user created');

    // Create librarian user
    const librarianUser = new User({
      fullName: 'أمين المكتبة',
      username: 'librarian',
      email: 'librarian@library.com',
      password: 'librarian123',
      role: 'librarian',
      job: 'أمين المكتبة'
    });
    await librarianUser.save();
    console.log('✅ Librarian user created');

    // Create sample users
    const sampleUsers = [
      {
        fullName: 'أحمد محمد علي',
        username: 'ahmed',
        email: 'ahmed@example.com',
        password: 'user123',
        job: 'طالب جامعي'
      },
      {
        fullName: 'فاطمة أحمد حسن',
        username: 'fatima',
        email: 'fatima@example.com',
        password: 'user123',
        job: 'مهندسة'
      },
      {
        fullName: 'محمد عبدالله سالم',
        username: 'mohammed',
        email: 'mohammed@example.com',
        password: 'user123',
        job: 'طبيب'
      }
    ];

    for (const user of sampleUsers) {
      const newUser = new User(user);
      await newUser.save();
    }
    console.log('✅ Sample users created');

    // Create sample books
    const sampleBooks = [
      {
        title: 'أساسيات البرمجة بلغة Python',
        author: 'د. أحمد محمد',
        publisher: 'دار المعرفة',
        referenceNumber: 'PY001',
        coverImage: '/uploads/books/python-basics.jpg',
        totalCopies: 5,
        availableCopies: 5,
        category: 'تكنولوجيا',
        description: 'كتاب شامل لتعلم أساسيات البرمجة بلغة Python للمبتدئين.',
        publicationYear: 2023,
        isbn: '978-1234567890',
        pages: 350,
        language: 'العربية',
        rating: 4.5,
        ratingCount: 12,
        tags: ['برمجة', 'python', 'مبتدئين'],
        addedBy: adminUser._id
      },
      {
        title: 'تاريخ الإسلام',
        author: 'د. خالد أحمد',
        publisher: 'دار الفكر العربي',
        referenceNumber: 'HIS001',
        coverImage: '/uploads/books/islamic-history.jpg',
        totalCopies: 3,
        availableCopies: 3,
        category: 'تاريخ',
        description: 'رحلة شاملة عبر تاريخ الإسلام والخلافة الراشدة.',
        publicationYear: 2022,
        isbn: '978-1234567891',
        pages: 480,
        language: 'العربية',
        rating: 4.8,
        ratingCount: 25,
        tags: ['إسلام', 'تاريخ', 'خلافة'],
        addedBy: librarianUser._id
      },
      {
        title: 'رواية الحلم',
        author: 'محمد عبد الرحمن',
        publisher: 'دار الأدب العربي',
        referenceNumber: 'NOV001',
        coverImage: '/uploads/books/village-dream.jpg',
        totalCopies: 4,
        availableCopies: 4,
        category: 'أدب',
        description: 'رواية مؤثرة تحكي عن حياة قرية صغيرة ومعاناة أهلها.',
        publicationYear: 2023,
        isbn: '978-1234567892',
        pages: 280,
        language: 'العربية',
        rating: 4.2,
        ratingCount: 18,
        tags: ['رواية', 'أدب', 'قرية'],
        addedBy: adminUser._id
      },
      {
        title: 'أساسيات الطب الباطني',
        author: 'د. فاطمة علي',
        publisher: 'دار الطب',
        referenceNumber: 'MED001',
        coverImage: '/uploads/books/internal-medicine.jpg',
        totalCopies: 2,
        availableCopies: 2,
        category: 'طب',
        description: 'دليل شامل للطب الباطني للطلاب والممارسين.',
        publicationYear: 2023,
        isbn: '978-1234567893',
        pages: 650,
        language: 'العربية',
        rating: 4.7,
        ratingCount: 8,
        tags: ['طب', 'باطني', 'طبيب'],
        addedBy: librarianUser._id
      },
      {
        title: 'فيزياء المرحلة الثانوية',
        author: 'د. محمد سالم',
        publisher: 'دار التعليم',
        referenceNumber: 'PHY001',
        coverImage: '/uploads/books/high-school-physics.jpg',
        totalCopies: 8,
        availableCopies: 8,
        category: 'علوم',
        description: 'كتاب الفيزياء للمرحلة الثانوية مع التمارين والحلول.',
        publicationYear: 2023,
        isbn: '978-1234567894',
        pages: 420,
        language: 'العربية',
        rating: 4.4,
        ratingCount: 35,
        tags: ['فيزياء', 'ثانوي', 'علمي'],
        addedBy: adminUser._id
      }
    ];

    for (const book of sampleBooks) {
      const newBook = new Book(book);
      await newBook.save();
    }
    console.log('✅ Sample books created');

    // Create library info
    const libraryInfo = [
      {
        title: 'حول المكتبة',
        content: 'مكتبة عبد الملك هي مكتبة إلكترونية حديثة تهدف إلى توفير المعرفة والثقافة للمجتمع. نسعى لجعل الكتب والمصادر العلمية في متناول الجميع.',
        type: 'about',
        isActive: true,
        order: 1,
        seoTitle: 'مكتبة عبد الملك - حولنا',
        seoDescription: 'تعرف على مكتبة عبد الملك الإلكترونية ومهمتها في نشر المعرفة والثقافة',
        updatedBy: adminUser._id
      },
      {
        title: 'رؤيتنا',
        content: 'أن نكون الوجهة الأولى للمعرفة في المنطقة، ونوفر بيئة تعليمية محفزة تساعد على التعلم والبحث.',
        type: 'vision',
        isActive: true,
        order: 2,
        updatedBy: adminUser._id
      },
      {
        title: 'خدماتنا',
        content: 'نقدم خدمات متنوعة تشمل: استعارة الكتب، البحث المتقدم، مراجعات الكتب، والإرشاد الأكاديمي.',
        type: 'services',
        isActive: true,
        order: 3,
        updatedBy: librarianUser._id
      },
      {
        title: 'قوانين المكتبة',
        content: 'يجب الالتزام بالقوانين التالية: احترام الكتب والموارد، إرجاع الكتب في المواعيد المحددة، الحفاظ على الهدوء في قاعات القراءة.',
        type: 'rules',
        isActive: true,
        order: 4,
        updatedBy: adminUser._id
      }
    ];

    for (const info of libraryInfo) {
      const newInfo = new LibraryInfo(info);
      await newInfo.save();
    }
    console.log('✅ Library info created');

    console.log('🎉 Database seeded successfully!');
    console.log('\n📝 Default credentials:');
    console.log('Admin: admin@library.com / admin123');
    console.log('Librarian: librarian@library.com / librarian123');
    console.log('User: ahmed@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedData();