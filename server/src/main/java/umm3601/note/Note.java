package umm3601.note;

import java.time.format.DateTimeFormatter;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.mongodb.lang.Nullable;

import org.mongojack.Id;


public class Note {

  @org.mongojack.ObjectId @Id
  public String _id;

  // Jackson should consider ownerID nullable, but Mongo shouldn't.
  // (Notes might have a null ownerID while they're in transit, but not
  // when they're in the database.)
  @JsonInclude(Include.NON_NULL)
  public String ownerID;

  public String body;

  public Date addDate = new Date();

  @Nullable @JsonInclude(Include.NON_NULL)
  public String expireDate;

  public String status;

}
