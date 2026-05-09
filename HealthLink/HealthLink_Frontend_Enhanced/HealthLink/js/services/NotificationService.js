class NotificationService {

    constructor() {

        this.baseUrl = (window.APP_CONFIG?.API_URL || "http://localhost:8080") + "/api/notifications";
    }

    getCurrentUser() {

        return JSON.parse(
            localStorage.getItem("user")
        );
    }

    async getNotifications() {

        try {

            const user =
                this.getCurrentUser();

            if (!user) return [];

            const response =
                await fetch(
                    `${this.baseUrl}/user/${user.id}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

            if (!response.ok) {
                return [];
            }

            return await response.json();

        } catch (error) {

            console.error(
                "Notification fetch error:",
                error
            );

            return [];
        }
    }

    async markAsRead(id) {

        try {

            await fetch(
                `${this.baseUrl}/${id}/read`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

        } catch (error) {

            console.error(
                "Mark read error:",
                error
            );
        }
    }

    async getUnreadCount() {

        const notifications =
            await this.getNotifications();

        return notifications.filter(
            n => !n.isRead
        ).length;
    }
}

export default new NotificationService();