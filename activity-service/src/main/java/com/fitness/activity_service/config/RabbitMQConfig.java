package com.fitness.activity_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;



@Configuration
public class RabbitMQConfig {

 @Value("${rabbitmq.queue.name}")
 private String queue;

 @Value("${rabbitmq.exchange.name}")
 private String exchange;

 @Value("${rabbitmq.routing.key}")
 private String routingKey;

//Creates a durable queue named activity.queue
 @Bean
 public Queue activityQueue() {
  return new Queue(queue, true);
 }

 //Create an exchange
 @Bean
 public DirectExchange activityExchange(){
   return new DirectExchange(exchange);
 }

 //Bind our queue with exchange in RabbitMQ
 @Bean
 public Binding activityBinding(Queue activityQueue, DirectExchange activityExchange){
   return BindingBuilder.bind(activityQueue).to(activityExchange).with(routingKey);
 }

 //Convert java objects to json before sending to MQ
 @Bean
 public MessageConverter jsonMessageConverter(){
   return new Jackson2JsonMessageConverter();
  }
 }
