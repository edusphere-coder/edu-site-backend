-- Create database if not exists
CREATE DATABASE IF NOT EXISTS edusphere_lms;
USE edusphere_lms;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  instructor_id INT,
  thumbnail VARCHAR(255),
  duration INT COMMENT 'Duration in minutes',
  level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_instructor (instructor_id),
  INDEX idx_published (is_published),
  INDEX idx_slug (slug)
);

-- Presentations table
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

-- Recordings table
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

-- Enrollments table
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
-- SEED DATA
-- ============================================

-- Insert 6 courses
INSERT IGNORE INTO courses (title, slug, description, duration, level, is_published) VALUES
('Machine Learning', 'machine-learning', 'Master the fundamentals of Machine Learning including supervised and unsupervised learning, neural networks, and deep learning frameworks.', 2400, 'intermediate', true),
('Full Stack Java', 'full-stack-java', 'Comprehensive Java development course covering Spring Boot, Hibernate, REST APIs, and modern web application development.', 3000, 'intermediate', true),
('Full Stack Python', 'full-stack-python', 'Learn full-stack Python development with Django, Flask, REST APIs, and modern frontend integration.', 2800, 'beginner', true),
('Data Analytics', 'data-analytics', 'Dive into data analytics with Python, SQL, data visualization, statistical analysis, and business intelligence tools.', 2200, 'beginner', true),
('Cyber Security', 'cyber-security', 'Comprehensive cybersecurity training covering network security, ethical hacking, penetration testing, and security best practices.', 2600, 'advanced', true),
('SAP', 'sap', 'Enterprise resource planning with SAP including modules for finance, logistics, human resources, and business processes.', 3200, 'intermediate', true);

-- Insert presentations for Machine Learning
INSERT IGNORE INTO presentations (course_id, title, description, file_url, order_index) VALUES
(1, 'Introduction to Machine Learning', 'Overview of ML concepts, types of learning, and real-world applications', '/presentations/ml/intro-to-ml.pdf', 1),
(1, 'Supervised Learning Fundamentals', 'Linear regression, logistic regression, and classification algorithms', '/presentations/ml/supervised-learning.pdf', 2),
(1, 'Unsupervised Learning', 'Clustering, dimensionality reduction, and anomaly detection', '/presentations/ml/unsupervised-learning.pdf', 3),
(1, 'Neural Networks Basics', 'Introduction to neural networks, activation functions, and backpropagation', '/presentations/ml/neural-networks.pdf', 4),
(1, 'Deep Learning with TensorFlow', 'Building deep learning models with TensorFlow and Keras', '/presentations/ml/deep-learning.pdf', 5);

-- Insert presentations for Full Stack Java
INSERT IGNORE INTO presentations (course_id, title, description, file_url, order_index) VALUES
(2, 'Java Fundamentals Review', 'Core Java concepts, OOP principles, and best practices', '/presentations/java/java-fundamentals.pdf', 1),
(2, 'Spring Boot Introduction', 'Getting started with Spring Boot and dependency injection', '/presentations/java/spring-boot-intro.pdf', 2),
(2, 'Building REST APIs', 'Creating RESTful web services with Spring Boot', '/presentations/java/rest-apis.pdf', 3),
(2, 'Database Integration with Hibernate', 'JPA, Hibernate ORM, and database operations', '/presentations/java/hibernate.pdf', 4),
(2, 'Frontend Integration', 'Connecting React/Angular with Spring Boot backend', '/presentations/java/frontend-integration.pdf', 5);

-- Insert presentations for Full Stack Python
INSERT IGNORE INTO presentations (course_id, title, description, file_url, order_index) VALUES
(3, 'Python Programming Essentials', 'Python syntax, data structures, and functional programming', '/presentations/python/python-essentials.pdf', 1),
(3, 'Django Framework', 'Building web applications with Django MVC framework', '/presentations/python/django-framework.pdf', 2),
(3, 'Flask Microservices', 'Creating lightweight APIs with Flask', '/presentations/python/flask-microservices.pdf', 3),
(3, 'Database Management', 'SQLAlchemy, PostgreSQL, and database migrations', '/presentations/python/database-management.pdf', 4),
(3, 'Deployment Strategies', 'Docker, AWS, and production deployment', '/presentations/python/deployment.pdf', 5);

-- Insert presentations for Data Analytics
INSERT IGNORE INTO presentations (course_id, title, description, file_url, order_index) VALUES
(4, 'Data Analytics Fundamentals', 'Introduction to data analysis, statistics, and business intelligence', '/presentations/analytics/fundamentals.pdf', 1),
(4, 'SQL for Data Analysis', 'Advanced SQL queries, joins, and data manipulation', '/presentations/analytics/sql-analysis.pdf', 2),
(4, 'Python for Data Science', 'Pandas, NumPy, and data processing libraries', '/presentations/analytics/python-data-science.pdf', 3),
(4, 'Data Visualization', 'Creating insights with Matplotlib, Seaborn, and Tableau', '/presentations/analytics/data-visualization.pdf', 4),
(4, 'Statistical Analysis', 'Hypothesis testing, regression, and predictive modeling', '/presentations/analytics/statistical-analysis.pdf', 5);

-- Insert presentations for Cyber Security
INSERT IGNORE INTO presentations (course_id, title, description, file_url, order_index) VALUES
(5, 'Cybersecurity Fundamentals', 'Security principles, threat landscape, and risk management', '/presentations/security/fundamentals.pdf', 1),
(5, 'Network Security', 'Firewalls, VPNs, intrusion detection systems', '/presentations/security/network-security.pdf', 2),
(5, 'Ethical Hacking', 'Penetration testing methodologies and tools', '/presentations/security/ethical-hacking.pdf', 3),
(5, 'Web Application Security', 'OWASP Top 10, XSS, SQL injection, and secure coding', '/presentations/security/web-security.pdf', 4),
(5, 'Incident Response', 'Security monitoring, incident handling, and forensics', '/presentations/security/incident-response.pdf', 5);

-- Insert presentations for SAP
INSERT IGNORE INTO presentations (course_id, title, description, file_url, order_index) VALUES
(6, 'SAP Overview', 'Introduction to SAP ERP, modules, and business processes', '/presentations/sap/overview.pdf', 1),
(6, 'SAP Finance Module', 'Financial accounting, controlling, and asset management', '/presentations/sap/finance.pdf', 2),
(6, 'SAP Logistics', 'Materials management, sales, and distribution', '/presentations/sap/logistics.pdf', 3),
(6, 'SAP Human Resources', 'Personnel administration, payroll, and talent management', '/presentations/sap/hr.pdf', 4),
(6, 'SAP Integration', 'System integration, data migration, and customization', '/presentations/sap/integration.pdf', 5);

-- Insert recordings for Machine Learning
INSERT IGNORE INTO recordings (course_id, title, description, video_url, duration, order_index) VALUES
(1, 'ML Introduction Lecture', 'Complete introduction to machine learning concepts and applications', '/recordings/ml/intro-lecture.mp4', 3600, 1),
(1, 'Supervised Learning Workshop', 'Hands-on workshop on regression and classification', '/recordings/ml/supervised-workshop.mp4', 5400, 2),
(1, 'Clustering Algorithms Demo', 'Practical demonstration of K-means and hierarchical clustering', '/recordings/ml/clustering-demo.mp4', 4200, 3),
(1, 'Neural Networks Deep Dive', 'Building neural networks from scratch', '/recordings/ml/neural-networks-dive.mp4', 6000, 4),
(1, 'TensorFlow Project Tutorial', 'Complete project walkthrough using TensorFlow', '/recordings/ml/tensorflow-tutorial.mp4', 7200, 5);

-- Insert recordings for Full Stack Java
INSERT IGNORE INTO recordings (course_id, title, description, video_url, duration, order_index) VALUES
(2, 'Java Refresher Course', 'Comprehensive Java programming review', '/recordings/java/java-refresher.mp4', 4800, 1),
(2, 'Spring Boot Setup', 'Setting up Spring Boot project from scratch', '/recordings/java/spring-setup.mp4', 3000, 2),
(2, 'REST API Development', 'Building complete REST API with CRUD operations', '/recordings/java/rest-api-dev.mp4', 5400, 3),
(2, 'Hibernate Tutorial', 'Database operations with Hibernate ORM', '/recordings/java/hibernate-tutorial.mp4', 4500, 4),
(2, 'Full Stack Project', 'Complete full-stack application development', '/recordings/java/fullstack-project.mp4', 9000, 5);

-- Insert recordings for Full Stack Python
INSERT IGNORE INTO recordings (course_id, title, description, video_url, duration, order_index) VALUES
(3, 'Python Crash Course', 'Fast-paced Python programming fundamentals', '/recordings/python/crash-course.mp4', 4200, 1),
(3, 'Django Web Development', 'Building web apps with Django framework', '/recordings/python/django-dev.mp4', 6000, 2),
(3, 'Flask API Tutorial', 'Creating RESTful APIs with Flask', '/recordings/python/flask-api.mp4', 3600, 3),
(3, 'Database with SQLAlchemy', 'Database modeling and operations', '/recordings/python/sqlalchemy.mp4', 4800, 4),
(3, 'Deployment Workshop', 'Deploying Python apps to production', '/recordings/python/deployment-workshop.mp4', 5400, 5);

-- Insert recordings for Data Analytics
INSERT IGNORE INTO recordings (course_id, title, description, video_url, duration, order_index) VALUES
(4, 'Data Analytics Bootcamp', 'Introduction to data analytics and tools', '/recordings/analytics/bootcamp.mp4', 3600, 1),
(4, 'SQL Masterclass', 'Advanced SQL techniques for data analysis', '/recordings/analytics/sql-masterclass.mp4', 5400, 2),
(4, 'Pandas Tutorial', 'Data manipulation with Python Pandas', '/recordings/analytics/pandas-tutorial.mp4', 4800, 3),
(4, 'Visualization Workshop', 'Creating compelling data visualizations', '/recordings/analytics/viz-workshop.mp4', 4200, 4),
(4, 'Statistical Modeling', 'Building predictive models with statistics', '/recordings/analytics/statistical-modeling.mp4', 6000, 5);

-- Insert recordings for Cyber Security
INSERT IGNORE INTO recordings (course_id, title, description, video_url, duration, order_index) VALUES
(5, 'Security Fundamentals', 'Core cybersecurity concepts and principles', '/recordings/security/fundamentals.mp4', 3600, 1),
(5, 'Network Security Lab', 'Hands-on network security configuration', '/recordings/security/network-lab.mp4', 5400, 2),
(5, 'Penetration Testing Demo', 'Live penetration testing demonstration', '/recordings/security/pentest-demo.mp4', 6600, 3),
(5, 'Web Security Workshop', 'Securing web applications against attacks', '/recordings/security/web-security.mp4', 4800, 4),
(5, 'Incident Response Simulation', 'Real-world incident response scenarios', '/recordings/security/incident-sim.mp4', 5400, 5);

-- Insert recordings for SAP
INSERT IGNORE INTO recordings (course_id, title, description, video_url, duration, order_index) VALUES
(6, 'SAP Introduction', 'Getting started with SAP ERP system', '/recordings/sap/introduction.mp4', 3000, 1),
(6, 'Finance Module Training', 'SAP financial accounting and controlling', '/recordings/sap/finance-training.mp4', 6000, 2),
(6, 'Logistics Configuration', 'Setting up SAP logistics modules', '/recordings/sap/logistics-config.mp4', 5400, 3),
(6, 'HR Module Overview', 'SAP human resources management', '/recordings/sap/hr-overview.mp4', 4800, 4),
(6, 'SAP Integration Project', 'Complete SAP integration case study', '/recordings/sap/integration-project.mp4', 7200, 5);

-- Activate any existing users (for initial setup/migration)
-- This ensures existing users can login after the is_active column is added
UPDATE users SET is_active = true WHERE is_active IS NULL OR is_active = false;
