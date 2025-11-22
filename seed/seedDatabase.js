const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Subject = require('../models/Subject');
const Topic = require('../models/Topic');

// Recursively find all JSON files in a directory
function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findJsonFiles(filePath, fileList);
    } else if (path.extname(file) === '.json') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await Subject.deleteMany({});
    await Topic.deleteMany({});
    console.log('✓ Cleared existing data');

    // Load subjects
    const subjectsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'subjects.json'), 'utf-8')
    );

    const subjects = await Subject.insertMany(subjectsData);
    console.log(`✓ Seeded ${subjects.length} subjects`);

    // Load topics for each subject
    let totalTopics = 0;
    
    for (const subject of subjects) {
      const subjectTopicsDir = path.join(__dirname, 'topics', subject.slug);
      
      // Check if subject directory exists
      if (!fs.existsSync(subjectTopicsDir)) {
        console.log(`⚠ No topics directory found for ${subject.name}`);
        continue;
      }

      // Find all JSON files in subject directory (including subdirectories)
      const jsonFiles = findJsonFiles(subjectTopicsDir);
      
      if (jsonFiles.length === 0) {
        console.log(`⚠ No topic files found for ${subject.name}`);
        continue;
      }

      let subjectTopicCount = 0;
      
      // Load topics from each JSON file
      for (const jsonFile of jsonFiles) {
        try {
          const topicsData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
          
          // Handle both array and single object formats
          const topicsArray = Array.isArray(topicsData) ? topicsData : [topicsData];
          
          // Add subject reference and flatten content structure
          const topicsWithSubject = topicsArray.map(topic => {
            // If content is nested, flatten it
            if (topic.content) {
              return {
                title: topic.title,
                slug: topic.slug,
                order: topic.order,
                subject: subject._id,
                ...topic.content  // Spread content fields to top level
              };
            }
            // Otherwise use as-is
            return {
              ...topic,
              subject: subject._id
            };
          });

          await Topic.insertMany(topicsWithSubject);
          subjectTopicCount += topicsArray.length;
          
          const fileName = path.basename(jsonFile);
          console.log(`  ✓ Loaded ${topicsArray.length} topic(s) from ${fileName}`);
        } catch (error) {
          console.error(`  ✗ Error loading ${jsonFile}:`, error.message);
        }
      }

      totalTopics += subjectTopicCount;
      console.log(`✓ Seeded ${subjectTopicCount} topics for ${subject.name}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log(`🎉 Database seeding completed successfully!`);
    console.log(`📚 Total: ${subjects.length} subjects, ${totalTopics} topics`);
    console.log('='.repeat(50));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
