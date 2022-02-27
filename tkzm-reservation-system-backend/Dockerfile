#FROM openjdk:11
FROM adoptopenjdk/openjdk11:jre-11.0.6_10-alpine
VOLUME /tmp
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
#ENTRYPOINT ["java","-Xmx256m -XX:+UseContainerSupport","-jar","/app.jar"]
EXPOSE 8080
