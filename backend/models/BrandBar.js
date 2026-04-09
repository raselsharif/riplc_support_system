const pool = require("../config/database");

class BrandBar {
  static async getSettings() {
    const [rows] = await pool.execute("SELECT logo_url, logo_public_id, company_name, subtitle FROM brandbar_settings LIMIT 1");
    return rows[0] || null;
  }

  static async updateSettings({ logo_url, logo_public_id, company_name, subtitle }) {
    const existing = await this.getSettings();

    const finalLogoUrl = logo_url !== undefined ? (logo_url || null) : existing?.logo_url || null;
    const finalLogoPublicId = logo_public_id !== undefined ? (logo_public_id || null) : existing?.logo_public_id || null;

    if (existing) {
      await pool.execute(
        "UPDATE brandbar_settings SET logo_url = ?, logo_public_id = ?, company_name = ?, subtitle = ?",
        [finalLogoUrl, finalLogoPublicId, company_name || null, subtitle || null]
      );
    } else {
      await pool.execute(
        "INSERT INTO brandbar_settings (logo_url, logo_public_id, company_name, subtitle) VALUES (?, ?, ?, ?)",
        [finalLogoUrl, finalLogoPublicId, company_name || null, subtitle || null]
      );
    }
    return this.getSettings();
  }
}

module.exports = BrandBar;
