const Contact = require("../models/Contact");

class ContactController {
  static async getAll(req, res) {
    try {
      const contacts = await Contact.findAll();
      const grouped = {};
      contacts.forEach((c) => {
        const branchName = c.branch_name || "Unassigned";
        const branchCode = c.branch_code || "0";
        const key = `${branchCode}|${branchName}`;
        if (!grouped[key]) {
          grouped[key] = { branch_name: branchName, branch_code: branchCode, contacts: [] };
        }
        grouped[key].contacts.push(c);
      });
      const result = Object.values(grouped).sort(
        (a, b) => parseInt(a.branch_code) - parseInt(b.branch_code)
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const contact = await Contact.findById(req.params.id);
      if (!contact) return res.status(404).json({ message: "Contact not found" });
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, phone, email, department_id, branch_id } = req.body;
      if (!name || !phone || !department_id || !branch_id) {
        return res.status(400).json({ message: "Name, phone, department, and branch are required" });
      }
      const id = await Contact.create({
        name,
        phone,
        email: email || null,
        department_id,
        branch_id,
        created_by: req.user?.id || null,
      });
      const contact = await Contact.findById(id);
      res.status(201).json(contact);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { name, phone, email, department_id, branch_id } = req.body;
      if (!name || !phone || !department_id || !branch_id) {
        return res.status(400).json({ message: "Name, phone, department, and branch are required" });
      }
      const contact = await Contact.update(req.params.id, {
        name,
        phone,
        email: email || null,
        department_id,
        branch_id,
      });
      if (!contact) return res.status(404).json({ message: "Contact not found" });
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const deleted = await Contact.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Contact not found" });
      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ContactController;
