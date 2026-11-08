package fu.sba302.exception;

/**
 * @author HuyTran - SE1910
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

