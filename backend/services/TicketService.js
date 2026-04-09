const Ticket = require("../models/Ticket");
const Message = require("../models/Message");
const Attachment = require("../models/Attachment");
const Approval = require("../models/Approval");
const StatusHistory = require("../models/StatusHistory");
const Department = require("../models/Department");

class TicketService {
  static getDepartmentForProblemType(problemType) {
    const departmentMap = {
      it: 1,
      underwriting: 2,
      mis: 3,
    };
    return departmentMap[problemType] || 1;
  }

  static async createTicket({
    userId,
    problemType,
    title,
    description,
    priority,
    branchId,
    createdIp = null,
  }) {
    const departmentId = this.getDepartmentForProblemType(problemType);
    const ticketNumber = Ticket.generateTicketNumber();

    // For MIS/Underwriting, tickets start in 'pending' status (awaiting approval)
    // For IT, tickets start in 'open' status
    const initialStatus =
      problemType === "underwriting" || problemType === "mis"
        ? "pending"
        : "open";

    const ticketId = await Ticket.create({
      ticket_number: ticketNumber,
      user_id: userId,
      department_id: departmentId,
      problem_type: problemType,
      title,
      description,
      priority: priority || "medium",
      branch_id: branchId,
      status: initialStatus,
      created_ip: createdIp,
    });

    await StatusHistory.create({
      ticketId,
      changedBy: userId,
      fromStatus: null,
      toStatus: initialStatus,
      remarks: "Ticket created",
    });

    return Ticket.findById(ticketId);
  }

  static async getTickets(filters = {}) {
    return Ticket.findAll(filters);
  }

  static async getTicketById(id) {
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const messages = await Message.findByTicketId(id);
    const attachments = await Attachment.findByTicketId(id);
    const approvals = await Approval.findByTicketId(id);
    const statusHistory = await StatusHistory.findByTicketId(id);

    return {
      ...ticket,
      messages,
      attachments,
      approvals,
      statusHistory,
    };
  }

  static async updateStatus(id, status, userId) {
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    // Prevent status updates on rejected or closed tickets
    if (ticket.status === "rejected") {
      throw new Error(
        "Cannot modify rejected tickets. This ticket has been rejected and is locked.",
      );
    }
    if (ticket.status === "closed") {
      throw new Error(
        "Cannot modify closed tickets. This ticket has been closed and is locked.",
      );
    }
    const previousStatus = ticket.status;
    await Ticket.updateStatus(id, status, userId);

    await StatusHistory.create({
      ticketId: id,
      changedBy: userId,
      fromStatus: previousStatus,
      toStatus: status,
    });

    return Ticket.findById(id);
  }

  static async addReply({ ticketId, senderId, message, senderIp = null, isInternal = false }) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (ticket.status === "closed") {
      throw new Error("Cannot reply to a closed ticket");
    }

    await Message.create({ ticketId, senderId, message, isInternal, senderIp });

    if (!isInternal) {
      await Ticket.updateStatus(ticketId, "pending", senderId);
    }

    return Message.findByTicketId(ticketId);
  }

  static async approveTicket(id, approverId, remarks) {
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (ticket.status !== "pending") {
      throw new Error("Only pending tickets can be approved");
    }

    const departmentMap = { underwriting: 2, mis: 3 };
    const currentDepartmentId =
      departmentMap[ticket.problem_type] || ticket.department_id;

    await Approval.create({
      ticketId: id,
      approverId,
      departmentId: currentDepartmentId,
      action: "approve",
      remarks,
      fromStatus: ticket.status,
      toStatus: "approved",
    });

    await StatusHistory.create({
      ticketId: id,
      changedBy: approverId,
      fromStatus: ticket.status,
      toStatus: "approved",
      remarks,
    });

    await Ticket.forwardToIT(id, approverId);

    const updatedTicket = await Ticket.findById(id);

    return updatedTicket;
  }

  static async rejectTicket(id, approverId, remarks) {
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (ticket.status !== "pending") {
      throw new Error("Only pending tickets can be rejected");
    }

    const departmentMap = { underwriting: 2, mis: 3 };
    const currentDepartmentId =
      departmentMap[ticket.problem_type] || ticket.department_id;

    await Approval.create({
      ticketId: id,
      approverId,
      departmentId: currentDepartmentId,
      action: "reject",
      remarks,
      fromStatus: ticket.status,
      toStatus: "rejected",
    });

    await StatusHistory.create({
      ticketId: id,
      changedBy: approverId,
      fromStatus: ticket.status,
      toStatus: "rejected",
      remarks,
    });

    await Ticket.updateStatus(id, "rejected", approverId);

    return Ticket.findById(id);
  }

  static async getStats(branchId = null) {
    return Ticket.getStats(branchId);
  }

  static async getBranchStats() {
    return Ticket.getBranchStats();
  }

  static async deleteTicket(id) {
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (ticket.status !== "open") {
      throw new Error("Only open tickets can be deleted");
    }

    await Ticket.delete(id);
    return { message: "Ticket deleted successfully" };
  }
}

module.exports = TicketService;
