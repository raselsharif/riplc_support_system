const TicketService = require("../services/TicketService");
const AttachmentService = require("../services/AttachmentService");
const { getDepartmentForProblemType } = require("../services/TicketService");
const ActivityLogService = require("../services/ActivityLogService");

class TicketController {
  static async create(req, res) {
    try {
      const { problem_type, title, description, priority } = req.body;
      const userId = req.user.id;
      const branchId = req.user.branch_id;
      const createdIp = req.clientIP;

      const ticket = await TicketService.createTicket({
        userId,
        problemType: problem_type,
        title,
        description,
        priority,
        branchId,
        createdIp,
      });

      ActivityLogService.log({
        user_id: userId,
        action: "create",
        entity_type: "ticket",
        entity_id: ticket.id,
        details: `Created ticket ${ticket.ticket_number}: ${title} | ip: ${createdIp || 'unknown'}`,
        client_ip: createdIp,
      }).catch(() => {});

      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { status, branch_id, branch_ids, date_from, date_to, search, problem_type, limit, offset } =
        req.query;

      const filters = {
        user_id: req.user.id,
        role: req.user.role,
      };

      if (req.user.role === "admin" || req.user.role === "it") {
        delete filters.user_id;
      } else if (req.user.role === "underwriting" || req.user.role === "mis") {
        delete filters.user_id;
        filters.problem_type = req.user.role;
      } else if (req.user.role === "user") {
        filters.user_id = req.user.id;
        if (branch_id) {
          filters.branch_id = parseInt(branch_id);
        }
      }

      if (status) {
        let statusArray = status;
        if (typeof status === 'string') {
          statusArray = status.split(',').map(s => s.trim());
        }
        if (Array.isArray(statusArray)) {
          filters.status = statusArray;
        } else {
          filters.status = status;
        }
      }
      if (branch_id) filters.branch_id = parseInt(branch_id);
      if (branch_ids) {
        const ids = Array.isArray(branch_ids) ? branch_ids : branch_ids.split(',');
        filters.branch_ids = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      }
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;
      if (search) filters.search = search;
      if (problem_type) filters.problem_type = problem_type;
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);

      const tickets = await TicketService.getTickets(filters);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const ticket = await TicketService.getTicketById(req.params.id);
      res.json(ticket);
    } catch (error) {
      const status = error.message === "Ticket not found" ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const ticket = await TicketService.updateStatus(
        req.params.id,
        status,
        req.user.id,
      );
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addReply(req, res) {
    try {
      const { message, is_internal } = req.body;
      const messages = await TicketService.addReply({
        ticketId: req.params.id,
        senderId: req.user.id,
        message,
        senderIp: req.clientIP,
        isInternal: is_internal || false,
      });
      res.status(201).json(messages);
    } catch (error) {
      const status =
        error.message === "Ticket not found" ||
        error.message === "Cannot reply to a closed ticket"
          ? 400
          : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const result = await TicketService.deleteTicket(req.params.id);
      res.json(result);
    } catch (error) {
      const status =
        error.message === "Ticket not found" ||
        error.message === "Only open tickets can be deleted"
          ? 400
          : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async approve(req, res) {
    try {
      const { remarks } = req.body;
      const ticket = await TicketService.approveTicket(
        req.params.id,
        req.user.id,
        remarks,
      );
      res.json(ticket);
    } catch (error) {
      const status = error.message === "Ticket not found" ? 404 : 400;
      res.status(status).json({ message: error.message });
    }
  }

  static async reject(req, res) {
    try {
      const { remarks } = req.body;
      const ticket = await TicketService.rejectTicket(
        req.params.id,
        req.user.id,
        remarks,
      );
      res.json(ticket);
    } catch (error) {
      const status = error.message === "Ticket not found" ? 404 : 400;
      res.status(status).json({ message: error.message });
    }
  }

  static async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const ticketId = req.params.id;
      const uploadedBy = req.user.id;

      await AttachmentService.uploadFile({
        ticketId,
        uploadedBy,
        file: req.file,
        fileType: "image",
      });

      const attachments = await AttachmentService.getAttachmentsByTicketId(ticketId);
      res.status(201).json(attachments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = TicketController;
