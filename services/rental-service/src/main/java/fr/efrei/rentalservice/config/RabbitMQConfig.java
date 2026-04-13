package fr.efrei.rentalservice.config;

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
    public static final String RENTAL_QUEUE = "rental.queue";
    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue rentalQueue() {
        return new Queue(RENTAL_QUEUE, true);
    }

    @Bean
    public Binding rentalBinding(Queue rentalQueue, TopicExchange exchange) {
        return BindingBuilder.bind(rentalQueue).to(exchange).with("booking.confirmed");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
