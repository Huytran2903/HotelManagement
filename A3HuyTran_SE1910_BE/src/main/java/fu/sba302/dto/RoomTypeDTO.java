package fu.sba302.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @author HuyTran - SE1910
 */
public class RoomTypeDTO {

    private Integer roomTypeId;

    @NotBlank(message = "Room type name is required")
    @Size(max = 50, message = "Room type name cannot exceed 50 characters")
    private String roomTypeName;

    @Size(max = 250, message = "Type description cannot exceed 250 characters")
    private String typeDescription;

    @Size(max = 250, message = "Type note cannot exceed 250 characters")
    private String typeNote;

    public RoomTypeDTO() {
    }

    public RoomTypeDTO(Integer roomTypeId, String roomTypeName, String typeDescription, String typeNote) {
        this.roomTypeId = roomTypeId;
        this.roomTypeName = roomTypeName;
        this.typeDescription = typeDescription;
        this.typeNote = typeNote;
    }

    public Integer getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Integer roomTypeId) {
        this.roomTypeId = roomTypeId;
    }

    public String getRoomTypeName() {
        return roomTypeName;
    }

    public void setRoomTypeName(String roomTypeName) {
        this.roomTypeName = roomTypeName;
    }

    public String getTypeDescription() {
        return typeDescription;
    }

    public void setTypeDescription(String typeDescription) {
        this.typeDescription = typeDescription;
    }

    public String getTypeNote() {
        return typeNote;
    }

    public void setTypeNote(String typeNote) {
        this.typeNote = typeNote;
    }
}

