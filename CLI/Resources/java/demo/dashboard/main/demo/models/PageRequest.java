package PackagePlaceHolder.demo.models;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PageRequest {
    private int page;
    private int size;

    public static PageRequest of(Integer page, Integer size) {
        return PageRequest.builder()
                .page(page != null ? page : 0)
                .size(size != null ? size : 50)
                .build();
    }

    public int getOffset() {
        return page * size;
    }
}
