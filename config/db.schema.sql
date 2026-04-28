-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  access_code VARCHAR(16) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('student','instructor','admin') DEFAULT 'student',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_access_code (access_code),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);

-- ============================================
-- COURSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  instructor_id INT,
  thumbnail VARCHAR(255),
  duration INT COMMENT 'Duration in minutes',
  level ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_instructor (instructor_id),
  INDEX idx_published (is_published),
  INDEX idx_slug (slug)
);

-- ============================================
-- PRESENTATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS presentations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,

  INDEX idx_course (course_id),
  INDEX idx_order (order_index)
);

-- ============================================
-- RECORDINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS recordings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  duration INT COMMENT 'Duration in seconds',
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,

  INDEX idx_course (course_id),
  INDEX idx_order (order_index)
);

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress INT DEFAULT 0 COMMENT 'Progress percentage 0-100',
  completed BOOLEAN DEFAULT false,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,

  UNIQUE KEY unique_enrollment (user_id, course_id),

  INDEX idx_user (user_id),
  INDEX idx_course (course_id)
);

-- ============================================
-- SEED COURSES
-- ============================================

INSERT IGNORE INTO courses (title, slug, description, duration, level, is_published) VALUES
('Machine Learning','machine-learning','Master ML including supervised and unsupervised learning, neural networks and deep learning.',2400,'intermediate',true),
('Full Stack Java','full-stack-java','Spring Boot, Hibernate, REST APIs and modern Java development.',3000,'intermediate',true),
('Full Stack Python','full-stack-python','Django, Flask, REST APIs and full stack Python development.',2800,'beginner',true),
('Data Analytics','data-analytics','Data analytics with Python, SQL, statistics and visualization.',2200,'beginner',true),
('Cyber Security','cyber-security','Cybersecurity, penetration testing, network security and ethical hacking.',2600,'advanced',true),
('SAP','sap','Enterprise SAP ERP modules for business operations.',3200,'intermediate',true);

-- ============================================
-- SAMPLE PRESENTATIONS
-- ============================================

INSERT IGNORE INTO presentations (course_id,title,description,file_url,order_index) VALUES
(1,'Introduction to Machine Learning','Overview of ML concepts','/presentations/ml/intro.pdf',1),
(1,'Supervised Learning','Regression and classification','/presentations/ml/supervised.pdf',2),
(1,'Unsupervised Learning','Clustering and dimensionality reduction','/presentations/ml/unsupervised.pdf',3),

(2,'Java Fundamentals','Core Java and OOP','/presentations/java/fundamentals.pdf',1),
(2,'Spring Boot','Spring Boot introduction','/presentations/java/springboot.pdf',2),

(3,'Python Basics','Python fundamentals','/presentations/python/basics.pdf',1),
(3,'Django Framework','Web development with Django','/presentations/python/django.pdf',2),

(4,'Analytics Introduction','Basics of data analytics','/presentations/analytics/intro.pdf',1),
(4,'SQL Analysis','SQL for analytics','/presentations/analytics/sql.pdf',2),

(5,'Cybersecurity Basics','Security principles','/presentations/security/basics.pdf',1),
(5,'Ethical Hacking','Pen testing intro','/presentations/security/hacking.pdf',2),

(6,'SAP Overview','Introduction to SAP','/presentations/sap/overview.pdf',1);

-- ============================================
-- SAMPLE RECORDINGS
-- ============================================

INSERT IGNORE INTO recordings (course_id,title,description,video_url,duration,order_index) VALUES
(1,'ML Introduction','Intro lecture','/recordings/ml/intro.mp4',3600,1),
(1,'ML Workshop','Hands on ML','/recordings/ml/workshop.mp4',5400,2),

(2,'Java Course Intro','Java basics','/recordings/java/intro.mp4',4200,1),
(2,'Spring Boot Tutorial','Spring Boot guide','/recordings/java/spring.mp4',4800,2),

(3,'Python Crash Course','Python basics','/recordings/python/crash.mp4',3600,1),
(3,'Django Tutorial','Django development','/recordings/python/django.mp4',5400,2),

(4,'Analytics Bootcamp','Analytics intro','/recordings/analytics/bootcamp.mp4',3600,1),

(5,'Security Fundamentals','Cyber security intro','/recordings/security/fundamentals.mp4',3600,1),

(6,'SAP Introduction','SAP basics','/recordings/sap/intro.mp4',3000,1);

-- ============================================
-- ACTIVATE USERS
-- ============================================

UPDATE users SET is_active = true WHERE is_active IS NULL OR is_active = false;
