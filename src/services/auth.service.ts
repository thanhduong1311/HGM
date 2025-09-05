import { supabase } from "@/lib/supabase";

export const authService = {
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      // Lấy thông tin người dùng hiện tại
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
      }

      // Xác thực lại session hiện tại
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }

      // Cập nhật mật khẩu
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        if (updateError.message.includes("auth")) {
          throw new Error("Không thể đổi mật khẩu, vui lòng thử lại sau");
        }
        throw updateError;
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || "Không thể đổi mật khẩu");
    }
  },
};
