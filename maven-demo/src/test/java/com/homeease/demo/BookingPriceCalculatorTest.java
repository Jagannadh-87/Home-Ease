package com.homeease.demo;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class BookingPriceCalculatorTest {
    @Test void addsEighteenPercentGst() { assertEquals(588.82, BookingPriceCalculator.totalWithGst(499), 0.001); }
    @Test void rejectsNegativePrice() { assertThrows(IllegalArgumentException.class, () -> BookingPriceCalculator.totalWithGst(-1)); }
    @Test void estimatesDurationByCategory() {
        assertEquals("60-90 minutes", BookingPriceCalculator.estimateDuration("AC Technician"));
        assertEquals("varies", BookingPriceCalculator.estimateDuration("Unknown"));
    }
}
