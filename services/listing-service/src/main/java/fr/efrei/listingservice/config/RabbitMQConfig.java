package fr.efrei.listingservice.config;

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
    public static final String LISTING_QUEUE = "listing.queue";
    public static final String LISTING_CREATED_KEY = "listing.created";
    public static final String LISTING_DELETED_KEY = "listing.deleted";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue listingQueue() {
        return new Queue(LISTING_QUEUE, true);
    }

    @Bean
    public Binding listingBinding(Queue listingQueue, TopicExchange exchange) {
        return BindingBuilder.bind(listingQueue).to(exchange).with("listing.*");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
