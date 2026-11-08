package fu.sba302.repository;

import fu.sba302.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author HuyTran - SE1910
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Optional<Customer> findByEmailAddressIgnoreCase(String emailAddress);

    boolean existsByEmailAddressIgnoreCase(String emailAddress);

    @Query("SELECT c FROM Customer c WHERE " +
           "(:keyword IS NULL OR LOWER(c.customerFullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.emailAddress) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR c.telephone LIKE CONCAT('%', :keyword, '%')) " +
           "ORDER BY c.customerId DESC")
    List<Customer> searchCustomers(@Param("keyword") String keyword);
}

