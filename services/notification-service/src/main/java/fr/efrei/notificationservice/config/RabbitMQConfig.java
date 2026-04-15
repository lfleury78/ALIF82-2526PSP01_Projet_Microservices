package fr.efrei.notificationservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "hessbnb.exchange";

    public static final String BOOKING_NOTIFICATION_QUEUE = "notification.booking.queue";
    public static final String LISTING_NOTIFICATION_QUEUE = "notification.listing.queue";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue bookingNotificationQueue() {
        return new Queue(BOOKING_NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Queue listingNotificationQueue() {
        return new Queue(LISTING_NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding bookingEventsBinding(Queue bookingNotificationQueue, TopicExchange exchange) {
        return BindingBuilder.bind(bookingNotificationQueue).to(exchange).with("booking.*");
    }

    @Bean
    public Binding listingEventsBinding(Queue listingNotificationQueue, TopicExchange exchange) {
        return BindingBuilder.bind(listingNotificationQueue).to(exchange).with("listing.deleted");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new Jackson2JsonMessageConverter(mapper);
    }
}
