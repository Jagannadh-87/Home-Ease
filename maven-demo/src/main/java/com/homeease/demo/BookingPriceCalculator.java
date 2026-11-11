package com.homeease.demo;

/** Small utility used to demonstrate Maven compile/test/package. */
public class BookingPriceCalculator {
    public static final double GST_RATE = 0.18;

    public static double totalWithGst(double basePrice) {
        if (basePrice < 0) throw new IllegalArgumentException("price cannot be negative");
        return Math.round(basePrice * (1 + GST_RATE) * 100.0) / 100.0;
    }

    public static String estimateDuration(String category) {
        return switch (category == null ? "" : category.toLowerCase()) {
            case "ac technician" -> "60-90 minutes";
            case "electrician" -> "30-60 minutes";
            case "plumber" -> "45-90 minutes";
            case "home cleaner" -> "2-4 hours";
            default -> "varies";
        };
    }

    public static void main(String[] args) {
        System.out.println("HomeEase Maven demo: Rs.499 service with GST = " + totalWithGst(499));
    }
}
