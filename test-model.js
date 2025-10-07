// Simple test to verify model structure
console.log('Testing LegacyWorkSchedule model...');

try {
    const mongoose = require('mongoose');
    const LegacyWorkSchedule = require('./src/models/LegacyWorkSchedule');
    
    console.log('✅ Model loaded successfully');
    console.log('Model name:', LegacyWorkSchedule.modelName);
    console.log('Collection name:', LegacyWorkSchedule.collection.name);
    
    // Test schema structure
    const schema = LegacyWorkSchedule.schema;
    console.log('Schema paths:', Object.keys(schema.paths));
    
} catch (error) {
    console.error('❌ Error loading model:', error.message);
    console.error('Stack:', error.stack);
}

console.log('\nTesting controller...');
try {
    const controller = require('./src/api/work-schedule/work-schedule-legacy.controller');
    console.log('✅ Controller loaded successfully');
    console.log('Controller type:', typeof controller);
} catch (error) {
    console.error('❌ Error loading controller:', error.message);
    console.error('Stack:', error.stack);
}