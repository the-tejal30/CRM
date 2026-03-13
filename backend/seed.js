/**
 * Seed script — populates the DB with demo data for testing.
 * Usage: node seed.js
 * Add --clean flag to wipe existing seed data first: node seed.js --clean
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Organization = require('./models/Organization');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Task = require('./models/Task');
const Note = require('./models/Note');

const CLEAN = process.argv.includes('--clean');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  if (CLEAN) {
    const org = await Organization.findOne({ organizationName: 'Acme Corp' });
    if (org) {
      const users = await User.find({ organizationId: org._id });
      const userIds = users.map((u) => u._id);
      const leads = await Lead.find({ organizationId: org._id });
      const leadIds = leads.map((l) => l._id);
      await Note.deleteMany({ leadId: { $in: leadIds } });
      await Task.deleteMany({ organizationId: org._id });
      await Lead.deleteMany({ organizationId: org._id });
      await User.deleteMany({ _id: { $in: userIds } });
      await Organization.deleteOne({ _id: org._id });
      console.log('Cleaned existing seed data');
    }
  }

  // ── Organization ──────────────────────────────────────────
  let org = await Organization.findOne({ organizationName: 'Acme Corp' });
  if (org) {
    console.log('Seed data already exists. Run with --clean to reset.');
    await mongoose.disconnect();
    return;
  }

  org = await Organization.create({ organizationName: 'Acme Corp' });

  // ── Users ─────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Sarah Mitchell',
    email: 'sarah@acmecorp.com',
    password: 'Admin@123',
    role: 'Admin',
    organizationId: org._id,
  });

  const employee = await User.create({
    name: 'James Rivera',
    email: 'james@acmecorp.com',
    password: 'Employee@123',
    role: 'Employee',
    organizationId: org._id,
  });

  org.createdBy = admin._id;
  await org.save();

  // ── Leads ─────────────────────────────────────────────────
  const lead1 = await Lead.create({
    organizationId: org._id,
    name: 'Mike Chen',
    company: 'Tech Solutions Ltd',
    email: 'mike@techsolutions.com',
    phone: '+1-555-0101',
    status: 'Qualified',
    dealValue: 45000,
    source: 'Referral',
    assignedTo: employee._id,
    createdBy: admin._id,
  });

  const lead2 = await Lead.create({
    organizationId: org._id,
    name: 'Priya Sharma',
    company: 'Global Retail Co',
    email: 'priya@globalretail.com',
    phone: '+1-555-0202',
    status: 'Contacted',
    dealValue: 12500,
    source: 'Website',
    assignedTo: admin._id,
    createdBy: admin._id,
  });

  const lead3 = await Lead.create({
    organizationId: org._id,
    name: 'Tom Bradley',
    company: 'FastShip Logistics',
    email: 'tom@fastship.com',
    phone: '+1-555-0303',
    status: 'Won',
    dealValue: 8200,
    source: 'Cold Call',
    assignedTo: employee._id,
    createdBy: admin._id,
  });

  const lead4 = await Lead.create({
    organizationId: org._id,
    name: 'Aisha Patel',
    company: 'BrightMed Solutions',
    email: 'aisha@brightmed.com',
    phone: '+1-555-0404',
    status: 'New',
    dealValue: 22000,
    source: 'Social Media',
    assignedTo: employee._id,
    createdBy: employee._id,
  });

  const lead5 = await Lead.create({
    organizationId: org._id,
    name: 'Carlos Mendes',
    company: 'SkyBuild Construction',
    email: 'carlos@skybuild.com',
    phone: '+1-555-0505',
    status: 'Lost',
    dealValue: 5000,
    source: 'Other',
    assignedTo: admin._id,
    createdBy: admin._id,
  });

  // ── Notes ─────────────────────────────────────────────────
  await Note.create({
    leadId: lead1._id,
    organizationId: org._id,
    content: 'Had intro call with Mike. Evaluating 3 vendors. Decision in 2 weeks. Key concern: onboarding time.',
    createdBy: employee._id,
  });
  await Note.create({
    leadId: lead1._id,
    organizationId: org._id,
    content: 'Sent proposal PDF. Mike liked the pricing tier. Requested a live demo next Monday.',
    createdBy: employee._id,
  });
  await Note.create({
    leadId: lead1._id,
    organizationId: org._id,
    content: 'Demo went well. They want to involve their CTO before signing. Following up Thursday.',
    createdBy: admin._id,
  });

  await Note.create({
    leadId: lead2._id,
    organizationId: org._id,
    content: 'Priya reached out via website contact form. Interested in the enterprise plan.',
    createdBy: admin._id,
  });
  await Note.create({
    leadId: lead2._id,
    organizationId: org._id,
    content: 'Initial call done. Budget is confirmed at $12k. Needs board approval before proceeding.',
    createdBy: admin._id,
  });

  await Note.create({
    leadId: lead3._id,
    organizationId: org._id,
    content: 'Contract signed. Onboarding scheduled for next week. Great experience with Tom.',
    createdBy: employee._id,
  });

  await Note.create({
    leadId: lead4._id,
    organizationId: org._id,
    content: 'Found us on LinkedIn. Wants a product walkthrough before committing.',
    createdBy: employee._id,
  });

  await Note.create({
    leadId: lead5._id,
    organizationId: org._id,
    content: 'Carlos went with a competitor due to pricing. May revisit in Q3.',
    createdBy: admin._id,
  });

  // ── Tasks ─────────────────────────────────────────────────
  const due = (daysFromNow) => new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

  await Task.create({
    organizationId: org._id,
    title: 'Follow up with Mike Chen after CTO meeting',
    description: 'Call Mike to get CTO feedback and push for contract signing.',
    leadId: lead1._id,
    assignedTo: employee._id,
    createdBy: admin._id,
    priority: 'High',
    dueDate: due(3),
    status: 'Pending',
  });

  await Task.create({
    organizationId: org._id,
    title: 'Prepare custom demo for Tech Solutions Ltd',
    description: 'Tailor the demo to showcase CRM integrations relevant to a SaaS company.',
    leadId: lead1._id,
    assignedTo: employee._id,
    createdBy: employee._id,
    priority: 'High',
    dueDate: due(1),
    status: 'Pending',
  });

  await Task.create({
    organizationId: org._id,
    title: 'Send contract to Global Retail Co',
    description: 'Draft and send MSA once Priya confirms board approval.',
    leadId: lead2._id,
    assignedTo: admin._id,
    createdBy: admin._id,
    priority: 'Medium',
    dueDate: due(5),
    status: 'Pending',
  });

  await Task.create({
    organizationId: org._id,
    title: 'Post-sale onboarding call — FastShip Logistics',
    description: 'Walk Tom through account setup and introduce the support team.',
    leadId: lead3._id,
    assignedTo: employee._id,
    createdBy: admin._id,
    priority: 'Low',
    dueDate: due(7),
    status: 'Completed',
  });

  await Task.create({
    organizationId: org._id,
    title: 'Schedule demo for BrightMed Solutions',
    leadId: lead4._id,
    assignedTo: employee._id,
    createdBy: employee._id,
    priority: 'Medium',
    dueDate: due(2),
    status: 'Pending',
  });

  await Task.create({
    organizationId: org._id,
    title: 'Quarterly team check-in — review pipeline',
    description: 'Review all open leads and reassign stale ones.',
    assignedTo: admin._id,
    createdBy: admin._id,
    priority: 'Low',
    dueDate: due(10),
    status: 'Pending',
  });

  console.log('\n✅ Seed complete!\n');
  console.log('  Organization : Acme Corp');
  console.log(`  Invite code  : ${org.inviteCode}`);
  console.log('');
  console.log('  Admin    → sarah@acmecorp.com  / Admin@123');
  console.log('  Employee → james@acmecorp.com  / Employee@123');
  console.log('');
  console.log(`  Leads   : 5  (New/Contacted/Qualified/Won/Lost)`);
  console.log(`  Notes   : 8`);
  console.log(`  Tasks   : 6  (1 completed)`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
