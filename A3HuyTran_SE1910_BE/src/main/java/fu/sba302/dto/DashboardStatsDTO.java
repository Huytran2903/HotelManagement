package fu.sba302.dto;

import java.util.List;

/**
 * @author HuyTran - SE1910
 */
public class DashboardStatsDTO {

    private long totalCustomers;
    private long totalRooms;
    private long activeRooms;
    private long totalBookings;
    private double totalRevenue;
    private List<BookingResponse> recentBookings;

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(long totalCustomers, long totalRooms, long activeRooms, long totalBookings, double totalRevenue, List<BookingResponse> recentBookings) {
        this.totalCustomers = totalCustomers;
        this.totalRooms = totalRooms;
        this.activeRooms = activeRooms;
        this.totalBookings = totalBookings;
        this.totalRevenue = totalRevenue;
        this.recentBookings = recentBookings;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getActiveRooms() {
        return activeRooms;
    }

    public void setActiveRooms(long activeRooms) {
        this.activeRooms = activeRooms;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<BookingResponse> getRecentBookings() {
        return recentBookings;
    }

    public void setRecentBookings(List<BookingResponse> recentBookings) {
        this.recentBookings = recentBookings;
    }
}

