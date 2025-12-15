package phishing

type EmailTemplate struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

var Templates = []EmailTemplate{
	{
		ID:      "tpl-001",
		Name:    "Password Reset",
		Subject: "Urgent: Password Expiry Notification",
		Body:    "Dear User,\n\nYour password is set to expire in 24 hours. Please click the link below to reset it immediately to avoid account lockout.\n\n[Link: Reset Password]\n\nRegards,\nIT Support",
	},
	{
		ID:      "tpl-002",
		Name:    "Urgent Invoice",
		Subject: "Overdue Invoice #99283",
		Body:    "Hello,\n\nWe have not received payment for invoice #99283. Please review the attached document and process payment immediately.\n\n[Link: View Invoice]\n\nRegards,\nFinance Team",
	},
	{
		ID:      "tpl-003",
		Name:    "Suspicious Login",
		Subject: "Security Alert: New Login Detected",
		Body:    "We detected a new login to your account from an unrecognized device in North Korea. If this wasn't you, click here to secure your account.\n\n[Link: Secure Account]\n\nRegards,\nSecurity Team",
	},
}
